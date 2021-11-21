import type { DElementSelector } from '../../hooks/element';
import type { DTransitionRef } from '../_transition';

import { isUndefined } from 'lodash';
import React, { useEffect, useCallback, useMemo, useImperativeHandle, useState } from 'react';
import ReactDOM from 'react-dom';
import { useImmer } from 'use-immer';

import { useDPrefixConfig, useDComponentConfig, useLockScroll, useCustomRef, useId, useAsync, useElement } from '../../hooks';
import { getClassName, globalMaxIndexManager, globalEscStack, globalScrollCapture, getFillingStyle } from '../../utils';
import { DMask } from '../_mask';
import { DTransition } from '../_transition';

export interface DDrawerContextData {
  drawerId: number;
  closeDrawer: () => void;
}
export const DDrawerContext = React.createContext<DDrawerContextData | null>(null);

export interface DDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dContainer?: DElementSelector | false;
  dPlacement?: 'top' | 'right' | 'bottom' | 'left';
  dWidth?: number | string;
  dHeight?: number | string;
  dZIndex?: number;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dHeader?: React.ReactNode;
  dFooter?: React.ReactNode;
  dDestroy?: boolean;
  dChildDrawer?: React.ReactNode;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
  __onVisibleChange?: (distance: { visible: boolean; top: number; right: number; bottom: number; left: number }) => void;
}

export interface DDrawerRef {
  el: HTMLElement | null;
  updatePosition: () => void;
}

export const DDrawer = React.forwardRef<DDrawerRef, DDrawerProps>((props, ref) => {
  const {
    dVisible = false,
    dContainer,
    dPlacement = 'right',
    dWidth = 400,
    dHeight = 280,
    dZIndex,
    dMask = true,
    dMaskClosable = true,
    dHeader,
    dFooter,
    dDestroy = false,
    dChildDrawer,
    onClose,
    afterVisibleChange,
    __onVisibleChange,
    className,
    style,
    children,
    ...restProps
  } = useDComponentConfig('drawer', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  //#region Ref
  const [transitionRefContent, transitionRef] = useCustomRef<DTransitionRef>();
  const [drawerEl, drawerRef] = useCustomRef<HTMLElement>();
  const [drawerContentEl, drawerContentRef] = useCustomRef<HTMLElement>();
  //#endregion

  const [currentData] = useState<{ preActiveEl: HTMLElement | null }>({
    preActiveEl: null,
  });

  const asyncCapture = useAsync();
  const id = useId();
  const [drawerPositionStyle, setDrawerPositionStyle] = useImmer<React.CSSProperties>({});
  const [zIndex, setZIndex] = useImmer(1000);

  const [hidden, setHidden] = useImmer(!dVisible);

  const handleContainer = useCallback(() => {
    if (isUndefined(dContainer)) {
      let el = document.getElementById(`${dPrefix}drawer-root`);
      if (!el) {
        el = document.createElement('div');
        el.id = `${dPrefix}drawer-root`;
        document.body.appendChild(el);
      }
      return el;
    } else if (dContainer === false) {
      return drawerEl?.parentElement ?? null;
    }
    return null;
  }, [dContainer, dPrefix, drawerEl?.parentElement]);
  const containerEl = useElement(dContainer, handleContainer);

  const [distance, setDistance] = useImmer<{ visible: boolean; top: number; right: number; bottom: number; left: number }>({
    visible: false,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  const handleMaskClose = useCallback(() => {
    if (dMaskClosable) {
      onClose?.();
    }
  }, [dMaskClosable, onClose]);

  const updatePosition = useCallback(() => {
    if (drawerEl) {
      if (isUndefined(dContainer)) {
        setDrawerPositionStyle({
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        });
      } else if (containerEl.current) {
        setDrawerPositionStyle({
          position: 'absolute',
          ...getFillingStyle(drawerEl, containerEl.current, false),
        });
      }
    }
  }, [dContainer, drawerEl, containerEl, setDrawerPositionStyle]);

  const closeDrawer = useCallback(() => {
    onClose?.();
  }, [onClose]);

  //#region DidUpdate
  useEffect(() => {
    if (dVisible) {
      setHidden(false);
    }
  }, [dVisible, setHidden]);

  useEffect(() => {
    if (dVisible) {
      if (isUndefined(dZIndex)) {
        if (isUndefined(dContainer)) {
          const [key, maxZIndex] = globalMaxIndexManager.getMaxIndex();
          setZIndex(maxZIndex);
          return () => {
            globalMaxIndexManager.deleteRecord(key);
          };
        } else {
          setZIndex(10);
        }
      } else {
        setZIndex(dZIndex);
      }
    }
  }, [dContainer, dVisible, dZIndex, setZIndex]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (dVisible && containerEl.current && transitionRefContent) {
      asyncGroup.onResize(containerEl.current, () => transitionRefContent.transitionThrottle.run(updatePosition));
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, containerEl, dVisible, transitionRefContent, updatePosition]);

  useEffect(() => {
    if (dVisible && transitionRefContent) {
      const tid = globalScrollCapture.addTask(() => transitionRefContent.transitionThrottle.run(updatePosition));
      return () => {
        globalScrollCapture.deleteTask(tid);
      };
    }
  }, [dVisible, transitionRefContent, updatePosition]);

  useEffect(() => {
    if (dVisible) {
      globalEscStack.stackPush(id, () => onClose?.());
      return () => {
        globalEscStack.stackDelete(id);
      };
    }
  }, [dVisible, id, onClose]);

  useEffect(() => {
    if (transitionRefContent) {
      transitionRefContent.transitionThrottle.run(updatePosition);
    }
  }, [transitionRefContent, updatePosition]);

  useLockScroll(dVisible && isUndefined(dContainer));
  //#endregion

  useImperativeHandle(
    ref,
    () => ({
      el: drawerEl,
      updatePosition,
    }),
    [drawerEl, updatePosition]
  );

  const childDrawer = useMemo(() => {
    if (dChildDrawer) {
      const _childDrawer = React.Children.only(dChildDrawer) as React.ReactElement<DDrawerProps>;
      return React.cloneElement<DDrawerProps>(_childDrawer, {
        ..._childDrawer.props,
        __onVisibleChange: (distance) => {
          setDistance(distance);
        },
      });
    }
    return null;
  }, [dChildDrawer, setDistance]);

  const contextValue = useMemo<DDrawerContextData>(() => ({ drawerId: id, closeDrawer }), [closeDrawer, id]);

  const drawerNode = (
    <DDrawerContext.Provider value={contextValue}>
      {dDestroy && hidden ? null : (
        <div
          {...restProps}
          ref={drawerRef}
          className={getClassName(className, `${dPrefix}drawer`)}
          style={{
            ...style,
            ...drawerPositionStyle,
            zIndex,
            transition: `transform 140ms ${distance.visible ? 'ease-out' : 'ease-in'} 60ms`,
            transform:
              dPlacement === 'top'
                ? `translateY(${(distance[dPlacement] / 3) * 2}px)`
                : dPlacement === 'right'
                ? `translateX(${-(distance[dPlacement] / 3) * 2}px)`
                : dPlacement === 'bottom'
                ? `translateY(${-(distance[dPlacement] / 3) * 2}px)`
                : `translateX(${(distance[dPlacement] / 3) * 2}px)`,
            display: !dDestroy && hidden ? 'none' : undefined,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dHeader ? `${dPrefix}drawer-content__header-${id}` : undefined}
          aria-describedby={`${dPrefix}drawer-content-${id}`}
        >
          {dMask && <DMask dVisible={dVisible} onClose={handleMaskClose} />}
          <DTransition
            ref={transitionRef}
            dEl={drawerContentEl}
            dVisible={dVisible}
            dStateList={() => {
              const transform =
                dPlacement === 'top'
                  ? 'translate(0, -100%)'
                  : dPlacement === 'right'
                  ? 'translate(100%, 0)'
                  : dPlacement === 'bottom'
                  ? 'translate(0, 100%)'
                  : 'translate(-100%, 0)';
              return {
                'enter-from': { transform },
                'enter-to': { transform: 'translate(0, 0)', transition: 'transform 0.2s ease-out' },
                'leave-to': { transform, transition: 'transform 0.2s ease-in' },
              };
            }}
            dCallbackList={() => {
              return {
                beforeEnter: (el) => {
                  updatePosition();
                  const rect = el.getBoundingClientRect();
                  __onVisibleChange?.({
                    visible: true,
                    top: distance.top + (dPlacement === 'top' ? rect.height : 0),
                    right: distance.right + (dPlacement === 'right' ? rect.width : 0),
                    bottom: distance.bottom + (dPlacement === 'bottom' ? rect.height : 0),
                    left: distance.left + (dPlacement === 'left' ? rect.width : 0),
                  });
                },
                afterEnter: (el) => {
                  afterVisibleChange?.(true);
                  currentData.preActiveEl = document.activeElement as HTMLElement | null;
                  el.focus({ preventScroll: true });
                },
                beforeLeave: () => {
                  currentData.preActiveEl?.focus({ preventScroll: true });
                  __onVisibleChange?.({
                    ...distance,
                    visible: false,
                  });
                },
                afterLeave: () => {
                  afterVisibleChange?.(false);
                  setHidden(true);
                },
              };
            }}
          >
            <div
              ref={drawerContentRef}
              id={`${dPrefix}drawer-content-${id}`}
              className={getClassName(`${dPrefix}drawer-content`, `${dPrefix}drawer-content--${dPlacement}`)}
              style={{
                width: dPlacement === 'left' || dPlacement === 'right' ? dWidth : undefined,
                height: dPlacement === 'bottom' || dPlacement === 'top' ? dHeight : undefined,
              }}
              tabIndex={-1}
            >
              {dHeader}
              <div className={`${dPrefix}drawer-content__body`}>{children}</div>
              {dFooter}
            </div>
          </DTransition>
        </div>
      )}
      {childDrawer}
    </DDrawerContext.Provider>
  );

  return dContainer === false ? drawerNode : containerEl.current && ReactDOM.createPortal(drawerNode, containerEl.current);
});
