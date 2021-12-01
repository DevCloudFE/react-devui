import type { DElementSelector } from '../../hooks/element-ref';
import type { Updater } from '../../hooks/immer';
import type { DPlacement } from '../../utils/position';
import type { DTransitionStateList, DTransitionRef } from '../_transition';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useImperativeHandle, useRef } from 'react';
import ReactDOM, { flushSync } from 'react-dom';

import { useDPrefixConfig, useAsync, useRefSelector, useId, useImmer, useRefCallback, useTwoWayBinding } from '../../hooks';
import { getClassName, globalMaxIndexManager, getPopupPlacementStyle } from '../../utils';
import { DTransition } from '../_transition';

export interface DTriggerRenderProps {
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
  [key: `data-${string}popup-trigger`]: string;
}

export interface DPopupRef {
  el: HTMLDivElement | null;
  triggerEl: HTMLElement | null;
  updatePosition: () => void;
}

export interface DPopupProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: [boolean, Updater<boolean>?];
  dPopupContent: React.ReactNode;
  dTriggerRender?: (props: DTriggerRenderProps) => React.ReactNode;
  dTriggerEl?: HTMLElement | null;
  dContainer?: DElementSelector | false;
  dPlacement?: DPlacement;
  dAutoPlace?: boolean;
  dTrigger?: 'hover' | 'focus' | 'click' | null;
  dDistance?: number;
  dArrow?: boolean;
  dZIndex?: number;
  dDestroy?: boolean;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dCustomPopup?: (
    popupEl: HTMLElement,
    triggerEl: HTMLElement
  ) => { top: number; left: number; stateList: DTransitionStateList; arrowPosition?: React.CSSProperties };
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export const DPopup = React.forwardRef<DPopupRef, DPopupProps>((props, ref) => {
  const {
    dVisible,
    dPopupContent,
    dTriggerRender,
    dTriggerEl,
    dContainer,
    dPlacement = 'top',
    dAutoPlace = true,
    dTrigger = 'hover',
    dDistance = 10,
    dArrow = true,
    dZIndex,
    dDestroy = false,
    dMouseEnterDelay = 150,
    dMouseLeaveDelay = 200,
    dCustomPopup,
    onVisibleChange,
    afterVisibleChange,
    className,
    children,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onClick,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  //#region Ref
  const [transition, transitionRef] = useRefCallback<DTransitionRef>();
  const [popupEl, popupRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const dataRef = useRef<{ clearTid: (() => void) | null }>({
    clearTid: null,
  });

  const asyncCapture = useAsync();
  const [popupPositionStyle, setPopupPositionStyle] = useImmer<React.CSSProperties>({});
  const [arrowPosition, setArrowStyle] = useImmer<React.CSSProperties | undefined>(undefined);
  const [zIndex, setZIndex] = useImmer(1000);
  const id = useId();

  const [visible, changeVisible] = useTwoWayBinding(false, dVisible, onVisibleChange);

  const [autoPlacement, setAutoPlacement] = useImmer<DPlacement>(dPlacement);

  const triggerRef = useRefSelector(isUndefined(dTriggerEl) ? `[data-${dPrefix}popup-trigger="${id}"]` : dTriggerEl);

  const handleContainer = useCallback(() => {
    if (isUndefined(dContainer)) {
      let el = document.getElementById(`${dPrefix}popup-root`);
      if (!el) {
        el = document.createElement('div');
        el.id = `${dPrefix}popup-root`;
        document.body.appendChild(el);
      }
      return el;
    } else if (dContainer === false) {
      return triggerRef.current?.parentElement ?? null;
    }
    return null;
  }, [dContainer, dPrefix, triggerRef]);
  const containerRef = useRefSelector(dContainer, handleContainer);

  const placement = dAutoPlace ? autoPlacement : dPlacement;

  const updatePosition = useCallback(() => {
    if (popupEl && triggerRef.current && containerRef.current) {
      const fixed = isUndefined(dContainer);

      if (isUndefined(dCustomPopup)) {
        let currentPlacement = dAutoPlace ? dPlacement : autoPlacement;

        if (dAutoPlace) {
          let space: [number, number, number, number] = [0, 0, 0, 0];
          if (!fixed) {
            const containerRect = containerRef.current.getBoundingClientRect();
            space = [
              containerRect.top,
              window.innerWidth - containerRect.left - containerRect.width,
              window.innerHeight - containerRect.top - containerRect.height,
              containerRect.left,
            ];
          }
          const position = getPopupPlacementStyle(popupEl, triggerRef.current, dPlacement, dDistance, fixed, space);
          if (position) {
            currentPlacement = position.placement;
            setAutoPlacement(position.placement);
            setPopupPositionStyle({
              position: fixed ? 'fixed' : 'absolute',
              top: position.top,
              left: position.left,
            });
          } else {
            const position = getPopupPlacementStyle(popupEl, triggerRef.current, autoPlacement, dDistance, fixed);
            setPopupPositionStyle({
              position: fixed ? 'fixed' : 'absolute',
              top: position.top,
              left: position.left,
            });
          }
        } else {
          const position = getPopupPlacementStyle(popupEl, triggerRef.current, dPlacement, dDistance, fixed);
          setPopupPositionStyle({
            position: fixed ? 'fixed' : 'absolute',
            top: position.top,
            left: position.left,
          });
        }

        let transformOrigin = 'center bottom';
        switch (currentPlacement) {
          case 'top':
            transformOrigin = 'center bottom';
            break;

          case 'top-left':
            transformOrigin = '20px bottom';
            break;

          case 'top-right':
            transformOrigin = 'calc(100% - 20px) bottom';
            break;

          case 'right':
            transformOrigin = 'left center';
            break;

          case 'right-top':
            transformOrigin = 'left 12px';
            break;

          case 'right-bottom':
            transformOrigin = 'left calc(100% - 12px)';
            break;

          case 'bottom':
            transformOrigin = 'center top';
            break;

          case 'bottom-left':
            transformOrigin = '20px top';
            break;

          case 'bottom-right':
            transformOrigin = 'calc(100% - 20px) top';
            break;

          case 'left':
            transformOrigin = 'right center';
            break;

          case 'left-top':
            transformOrigin = 'right 12px';
            break;

          case 'left-bottom':
            transformOrigin = 'right calc(100% - 12px)';
            break;

          default:
            break;
        }
        return {
          'enter-from': { transform: 'scale(0)', opacity: '0' },
          'enter-to': { transition: 'transform 0.1s ease-out, opacity 0.1s ease-out', transformOrigin },
          'leave-to': { transform: 'scale(0)', opacity: '0', transition: 'transform 0.1s ease-in, opacity 0.1s ease-in', transformOrigin },
        };
      } else {
        const { top, left, stateList, arrowPosition } = dCustomPopup(popupEl, triggerRef.current);
        setArrowStyle(arrowPosition);
        setPopupPositionStyle({
          position: fixed ? 'fixed' : 'absolute',
          top,
          left,
        });
        return stateList;
      }
    }
  }, [
    autoPlacement,
    containerRef,
    dAutoPlace,
    dContainer,
    dCustomPopup,
    dDistance,
    dPlacement,
    popupEl,
    setArrowStyle,
    setAutoPlacement,
    setPopupPositionStyle,
    triggerRef,
  ]);

  const handleMouseEnter = useCallback(
    (e) => {
      onMouseEnter?.(e);

      if (dTrigger === 'hover') {
        dataRef.current.clearTid && dataRef.current.clearTid();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          dataRef.current.clearTid = null;
          changeVisible(true);
        }, dMouseEnterDelay);
      }
    },
    [onMouseEnter, dTrigger, asyncCapture, dMouseEnterDelay, changeVisible]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      onMouseLeave?.(e);

      if (dTrigger === 'hover') {
        dataRef.current.clearTid && dataRef.current.clearTid();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          dataRef.current.clearTid = null;
          changeVisible(false);
        }, dMouseLeaveDelay);
      }
    },
    [onMouseLeave, dTrigger, asyncCapture, dMouseLeaveDelay, changeVisible]
  );

  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);

      if (dTrigger === 'focus') {
        dataRef.current.clearTid && dataRef.current.clearTid();
        changeVisible(true);
      }
    },
    [onFocus, dTrigger, changeVisible]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);

      if (dTrigger === 'focus') {
        dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(false), 20);
      }
    },
    [onBlur, dTrigger, asyncCapture, changeVisible]
  );

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      if (dTrigger === 'click') {
        dataRef.current.clearTid && dataRef.current.clearTid();
        changeVisible(true);
      }
    },
    [onClick, dTrigger, changeVisible]
  );

  //#region DidUpdate
  useEffect(() => {
    if (visible) {
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
  }, [dContainer, dZIndex, setZIndex, visible]);

  useEffect(() => {
    if (!isUndefined(dTriggerEl)) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();
      if (triggerRef.current) {
        if (dTrigger === 'hover') {
          asyncGroup.fromEvent(triggerRef.current, 'mouseenter').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              dataRef.current.clearTid = asyncCapture.setTimeout(() => {
                dataRef.current.clearTid = null;
                flushSync(() => changeVisible(true));
              }, dMouseEnterDelay);
            },
          });
          asyncGroup.fromEvent(triggerRef.current, 'mouseleave').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              dataRef.current.clearTid = asyncCapture.setTimeout(() => {
                dataRef.current.clearTid = null;
                flushSync(() => changeVisible(false));
              }, dMouseLeaveDelay);
            },
          });
        }

        if (dTrigger === 'focus') {
          asyncGroup.fromEvent(triggerRef.current, 'focus').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              flushSync(() => changeVisible(true));
            },
          });
          asyncGroup.fromEvent(triggerRef.current, 'blur').subscribe({
            next: () => {
              dataRef.current.clearTid = asyncCapture.setTimeout(() => flushSync(() => changeVisible(false)), 20);
            },
          });
        }

        if (dTrigger === 'click') {
          asyncGroup.fromEvent(triggerRef.current, 'click').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              flushSync(() => changeVisible(!visible));
            },
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, changeVisible, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, dTriggerEl, triggerRef, visible]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dTrigger === 'click') {
      asyncGroup.fromEvent(window, 'click', { capture: true }).subscribe({
        next: () => {
          dataRef.current.clearTid = asyncCapture.setTimeout(() => {
            flushSync(() => changeVisible(false));
          }, 20);
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, changeVisible, dTrigger]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (visible && triggerRef.current && popupEl) {
      const throttleUpdate = () => {
        if (transition) {
          transition.transitionThrottle.run(updatePosition);
        }
      };

      throttleUpdate();

      asyncGroup.onResize(popupEl, throttleUpdate);

      asyncGroup.onResize(triggerRef.current, throttleUpdate);

      asyncGroup.onGlobalScroll(throttleUpdate);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, visible, updatePosition, triggerRef, popupEl, transition]);
  //#endregion

  useImperativeHandle(
    ref,
    () => ({
      el: popupEl,
      triggerEl: triggerRef.current,
      updatePosition,
    }),
    [popupEl, triggerRef, updatePosition]
  );

  const triggerRenderProps = useMemo<DTriggerRenderProps>(() => {
    const _triggerRenderProps: DTriggerRenderProps = { [`data-${dPrefix}popup-trigger`]: String(id) };
    if (dTrigger === 'hover') {
      _triggerRenderProps.onMouseEnter = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          dataRef.current.clearTid = null;
          changeVisible(true);
        }, dMouseEnterDelay);
      };
      _triggerRenderProps.onMouseLeave = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          dataRef.current.clearTid = null;
          changeVisible(false);
        }, dMouseLeaveDelay);
      };
    }
    if (dTrigger === 'focus') {
      _triggerRenderProps.onFocus = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        changeVisible(true);
      };
      _triggerRenderProps.onBlur = () => {
        dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(false), 20);
      };
    }
    if (dTrigger === 'click') {
      _triggerRenderProps.onClick = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        changeVisible(!visible);
      };
    }

    return _triggerRenderProps;
  }, [asyncCapture, changeVisible, dMouseEnterDelay, dMouseLeaveDelay, dPrefix, dTrigger, id, visible]);

  return (
    <>
      {dTriggerRender?.(triggerRenderProps)}
      <DTransition
        dEl={popupEl}
        ref={transitionRef}
        dVisible={visible}
        dStateList={updatePosition}
        dCallbackList={{
          afterEnter: () => {
            afterVisibleChange?.(true);
          },
          afterLeave: () => {
            afterVisibleChange?.(false);
          },
        }}
        dRender={(hidden) =>
          !(dDestroy && hidden) &&
          dPopupContent &&
          containerRef.current &&
          ReactDOM.createPortal(
            <div
              {...restProps}
              ref={popupRef}
              className={getClassName(className, `${dPrefix}popup`, `${dPrefix}popup--` + placement)}
              style={{
                ...popupPositionStyle,
                display: hidden ? 'none' : undefined,
                zIndex,
              }}
              tabIndex={-1}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onClick={handleClick}
            >
              {dArrow && (
                <div
                  className={getClassName(`${dPrefix}popup__arrow`, {
                    'is-custom': arrowPosition,
                  })}
                  style={arrowPosition}
                ></div>
              )}
              {dPopupContent}
            </div>,
            containerRef.current
          )
        }
      />
    </>
  );
});
