import type { DElementSelector } from '../../hooks/element-ref';
import type { DTransitionRef } from '../_transition';

import { isUndefined } from 'lodash';
import React, { useEffect, useCallback, useMemo, useImperativeHandle, useRef } from 'react';
import ReactDOM from 'react-dom';

import {
  useDPrefixConfig,
  useDComponentConfig,
  useLockScroll,
  useId,
  useAsync,
  useRefSelector,
  useImmer,
  useRefCallback,
} from '../../hooks';
import { getClassName, globalMaxIndexManager, getFillingStyle } from '../../utils';
import { DMask } from '../_mask';
import { DTransition } from '../_transition';

export interface DDrawerContextData {
  drawerId: number;
  closeDrawer: () => void;
}
export const DDrawerContext = React.createContext<DDrawerContextData | null>(null);

export interface DDrawerRef {
  el: HTMLDivElement | null;
  updatePosition: () => void;
}

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
  const [transition, transitionRef] = useRefCallback<DTransitionRef>();
  const [drawerEl, drawerRef] = useRefCallback<HTMLDivElement>();
  const [drawerContentEl, drawerContentRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const dataRef = useRef<{ preActiveEl: HTMLElement | null }>({
    preActiveEl: null,
  });

  const asyncCapture = useAsync();
  const id = useId();
  const [absoluteStyle, setAbsoluteStyle] = useImmer<React.CSSProperties>({});
  const [zIndex, setZIndex] = useImmer(1000);

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
  const containerRef = useRefSelector(dContainer, handleContainer);

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
    if (drawerEl && containerRef.current) {
      setAbsoluteStyle({
        position: 'absolute',
        ...getFillingStyle(drawerEl, containerRef.current, false),
      });
    }
  }, [containerRef, drawerEl, setAbsoluteStyle]);

  const closeDrawer = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useLockScroll(dVisible && isUndefined(dContainer));

  //#region DidUpdate
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
    if (dVisible && !isUndefined(dContainer) && containerRef.current) {
      const throttleUpdate = () => {
        if (transition) {
          transition.transitionThrottle.run(updatePosition);
        }
      };

      throttleUpdate();

      asyncGroup.onResize(containerRef.current, throttleUpdate);

      asyncGroup.onGlobalScroll(throttleUpdate);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, containerRef, dContainer, dVisible, transition, updatePosition]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (dVisible) {
      asyncGroup.onEscKeydown(() => onClose?.());
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, dVisible, id, onClose]);
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
      <DTransition
        dEl={drawerContentEl}
        ref={transitionRef}
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
            'enter-to': { transition: 'transform 0.2s ease-out' },
            'leave-to': { transform, transition: 'transform 0.2s ease-in' },
          };
        }}
        dCallbackList={() => {
          return {
            beforeEnter: () => {
              if (!isUndefined(dContainer)) {
                updatePosition();
              }
              if (drawerContentEl) {
                const rect = drawerContentEl.getBoundingClientRect();
                __onVisibleChange?.({
                  visible: true,
                  top: distance.top + (dPlacement === 'top' ? rect.height : 0),
                  right: distance.right + (dPlacement === 'right' ? rect.width : 0),
                  bottom: distance.bottom + (dPlacement === 'bottom' ? rect.height : 0),
                  left: distance.left + (dPlacement === 'left' ? rect.width : 0),
                });
              }
            },
            afterEnter: () => {
              if (drawerContentEl) {
                afterVisibleChange?.(true);
                dataRef.current.preActiveEl = document.activeElement as HTMLElement | null;
                drawerContentEl.focus({ preventScroll: true });
              }
            },
            beforeLeave: () => {
              dataRef.current.preActiveEl?.focus({ preventScroll: true });
              __onVisibleChange?.({
                ...distance,
                visible: false,
              });
            },
            afterLeave: () => {
              afterVisibleChange?.(false);
            },
          };
        }}
        dRender={(hidden) =>
          !(dDestroy && hidden) && (
            <div
              {...restProps}
              ref={drawerRef}
              className={getClassName(className, `${dPrefix}drawer`)}
              style={{
                ...style,
                ...(isUndefined(dContainer) ? {} : absoluteStyle),
                display: hidden ? 'none' : undefined,
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
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dHeader ? `${dPrefix}drawer-content__header-${id}` : undefined}
              aria-describedby={`${dPrefix}drawer-content-${id}`}
            >
              {dMask && <DMask dVisible={dVisible} onClose={handleMaskClose} />}
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
            </div>
          )
        }
      />
      {childDrawer}
    </DDrawerContext.Provider>
  );

  return dContainer === false ? drawerNode : containerRef.current && ReactDOM.createPortal(drawerNode, containerRef.current);
});
