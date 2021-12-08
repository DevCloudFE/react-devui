import type { DElementSelector } from '../../hooks/element-ref';
import type { Updater } from '../../hooks/immer';

import { isUndefined } from 'lodash';
import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';

import { usePrefixConfig, useComponentConfig, useLockScroll, useId, useAsync, useRefSelector, useImmer, useRefCallback } from '../../hooks';
import { getClassName, MAX_INDEX_MANAGER, mergeStyle } from '../../utils';
import { DMask } from '../_mask';
import { DTransition } from '../_transition';

export interface DDrawerContextData {
  drawerId: number;
  closeDrawer: () => void;
}
export const DDrawerContext = React.createContext<DDrawerContextData | null>(null);

export interface DDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: [boolean, Updater<boolean>?];
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

export function DDrawer(props: DDrawerProps) {
  const {
    dVisible,
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
  } = useComponentConfig(DDrawer.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [drawerEl, drawerRef] = useRefCallback<HTMLDivElement>();
  const [drawerContentEl, drawerContentRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const dataRef = useRef<{ preActiveEl: HTMLElement | null }>({
    preActiveEl: null,
  });

  const asyncCapture = useAsync();
  const id = useId();
  const [zIndex, setZIndex] = useImmer<string | number>(1000);

  const [visible, setVisible] = dVisible;

  const isFixed = isUndefined(dContainer);
  const handleContainer = useCallback(() => {
    if (isFixed) {
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
  }, [dContainer, dPrefix, drawerEl?.parentElement, isFixed]);
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
      setVisible?.(false);
      onClose?.();
    }
  }, [dMaskClosable, onClose, setVisible]);

  const closeDrawer = useCallback(() => {
    setVisible?.(false);
    onClose?.();
  }, [onClose, setVisible]);

  useLockScroll(visible && isFixed);

  //#region DidUpdate
  useEffect(() => {
    if (visible) {
      if (isUndefined(dZIndex)) {
        if (isFixed) {
          const [key, maxZIndex] = MAX_INDEX_MANAGER.getMaxIndex();
          setZIndex(maxZIndex);
          return () => {
            MAX_INDEX_MANAGER.deleteRecord(key);
          };
        } else {
          setZIndex(`var(--${dPrefix}absolute-z-index)`);
        }
      } else {
        setZIndex(dZIndex);
      }
    }
  }, [dPrefix, dZIndex, isFixed, setZIndex, visible]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (visible) {
      asyncGroup.onEscKeydown(closeDrawer);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, closeDrawer, id, visible]);
  //#endregion

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
        dVisible={visible}
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
              style={mergeStyle(style, {
                position: isFixed ? undefined : 'absolute',
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
              })}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dHeader ? `${dPrefix}drawer-header-${id}` : undefined}
              aria-describedby={`${dPrefix}drawer-content-${id}`}
            >
              {dMask && <DMask dVisible={visible} onClose={handleMaskClose} />}
              <div
                ref={drawerContentRef}
                id={`${dPrefix}drawer-content-${id}`}
                className={getClassName(`${dPrefix}drawer__content`, `${dPrefix}drawer__content--${dPlacement}`)}
                style={{
                  width: dPlacement === 'left' || dPlacement === 'right' ? dWidth : undefined,
                  height: dPlacement === 'bottom' || dPlacement === 'top' ? dHeight : undefined,
                }}
                tabIndex={-1}
              >
                {dHeader}
                <div className={`${dPrefix}drawer__content-body`}>{children}</div>
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
}
