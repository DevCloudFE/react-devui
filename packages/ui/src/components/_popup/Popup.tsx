import type { DElementSelector } from '../../hooks/element-ref';
import type { DPlacement } from '../../utils/position';
import type { DTransitionStateList } from '../_transition';

import { isUndefined, toNumber } from 'lodash';
import React, { useCallback, useEffect, useMemo, useImperativeHandle, useRef } from 'react';
import ReactDOM, { flushSync } from 'react-dom';

import { usePrefixConfig, useAsync, useRefSelector, useId, useImmer, useRefCallback, useRootContentConfig } from '../../hooks';
import { getClassName, getPopupPlacementStyle, mergeStyle, MAX_INDEX_MANAGER } from '../../utils';
import { DTransition } from '../_transition';
import { checkOutEl } from './utils';

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
  dVisible: boolean;
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
    style,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onClick,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const rootContentRef = useRootContentConfig();
  //#endregion

  //#region Ref
  const [popupEl, popupRef] = useRefCallback<HTMLDivElement>();
  const [hoverReferenceEl, hoverReferenceRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const dataRef = useRef<{ clearTid: (() => void) | null; hasCancelLeave: boolean; transitionState?: DTransitionStateList }>({
    clearTid: null,
    hasCancelLeave: false,
  });

  const asyncCapture = useAsync();
  const [popupPositionStyle, setPopupPositionStyle] = useImmer<React.CSSProperties>({});
  const [arrowPosition, setArrowStyle] = useImmer<React.CSSProperties | undefined>(undefined);
  const [zIndex, setZIndex] = useImmer(1000);
  const id = useId();

  const [autoPlacement, setAutoPlacement] = useImmer<DPlacement>(dPlacement);

  const triggerRef = useRefSelector(isUndefined(dTriggerEl) ? `[data-${dPrefix}popup-trigger="${id}"]` : dTriggerEl);

  const isFixed = isUndefined(dContainer);
  const handleContainer = useCallback(() => {
    if (isFixed) {
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
  }, [dContainer, dPrefix, isFixed, triggerRef]);
  const containerRef = useRefSelector(dContainer, handleContainer);

  const placement = dAutoPlace ? autoPlacement : dPlacement;

  const updatePosition = useCallback(() => {
    if (popupEl && triggerRef.current && containerRef.current) {
      if (isUndefined(dCustomPopup)) {
        let currentPlacement = dAutoPlace ? dPlacement : autoPlacement;

        if (dAutoPlace) {
          let space: [number, number, number, number] = [0, 0, 0, 0];
          if (!isFixed) {
            const containerRect = containerRef.current.getBoundingClientRect();
            space = [
              containerRect.top,
              window.innerWidth - containerRect.left - containerRect.width,
              window.innerHeight - containerRect.top - containerRect.height,
              containerRect.left,
            ];
          }
          const position = getPopupPlacementStyle(popupEl, triggerRef.current, dPlacement, dDistance, isFixed, space);
          if (position) {
            currentPlacement = position.placement;
            setAutoPlacement(position.placement);
            setPopupPositionStyle({
              position: isFixed ? 'fixed' : 'absolute',
              top: position.top,
              left: position.left,
            });
          } else {
            const position = getPopupPlacementStyle(popupEl, triggerRef.current, autoPlacement, dDistance, isFixed);
            setPopupPositionStyle({
              position: isFixed ? 'fixed' : 'absolute',
              top: position.top,
              left: position.left,
            });
          }
        } else {
          const position = getPopupPlacementStyle(popupEl, triggerRef.current, dPlacement, dDistance, isFixed);
          setPopupPositionStyle({
            position: isFixed ? 'fixed' : 'absolute',
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
        dataRef.current.transitionState = {
          'enter-from': { transform: 'scale(0)', opacity: '0' },
          'enter-to': { transition: 'transform 0.1s ease-out, opacity 0.1s ease-out', transformOrigin },
          'leave-to': { transform: 'scale(0)', opacity: '0', transition: 'transform 0.1s ease-in, opacity 0.1s ease-in', transformOrigin },
        };
      } else {
        const { top, left, stateList, arrowPosition } = dCustomPopup(popupEl, triggerRef.current);
        setArrowStyle(arrowPosition);
        setPopupPositionStyle({
          position: isFixed ? 'fixed' : 'absolute',
          top,
          left,
        });
        dataRef.current.transitionState = stateList;
      }
    }
  }, [
    autoPlacement,
    containerRef,
    dAutoPlace,
    dCustomPopup,
    dDistance,
    dPlacement,
    isFixed,
    popupEl,
    setArrowStyle,
    setAutoPlacement,
    setPopupPositionStyle,
    triggerRef,
  ]);

  // `onMouseEnter` and `onMouseLeave` trigger time is uncertain.
  // Very strange, sometimes popup element emit `onMouseEnter` before
  // trigger element emit `onMouseLeave`.
  // It's also no emit `onMouseEnter` when enter to popup element sometimes.
  const checkMouseLeave = useCallback(() => {
    if (hoverReferenceEl && triggerRef.current) {
      return checkOutEl(hoverReferenceEl) && checkOutEl(triggerRef.current);
    }

    return false;
  }, [hoverReferenceEl, triggerRef]);

  const handleMouseEnter = useCallback(
    (e) => {
      onMouseEnter?.(e);

      if (dTrigger === 'hover') {
        dataRef.current.clearTid && dataRef.current.clearTid();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          dataRef.current.clearTid = null;
          onVisibleChange?.(true);
        }, dMouseEnterDelay);
      }
    },
    [onMouseEnter, dTrigger, asyncCapture, dMouseEnterDelay, onVisibleChange]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      onMouseLeave?.(e);

      if (dTrigger === 'hover') {
        dataRef.current.clearTid && dataRef.current.clearTid();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          dataRef.current.clearTid = null;
          if (checkMouseLeave()) {
            onVisibleChange?.(false);
          } else {
            dataRef.current.hasCancelLeave = true;
          }
        }, dMouseLeaveDelay);
      }
    },
    [onMouseLeave, dTrigger, asyncCapture, dMouseLeaveDelay, checkMouseLeave, onVisibleChange]
  );

  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);

      if (dTrigger === 'focus') {
        dataRef.current.clearTid && dataRef.current.clearTid();
        onVisibleChange?.(true);
      }
    },
    [onFocus, dTrigger, onVisibleChange]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);

      if (dTrigger === 'focus') {
        dataRef.current.clearTid = asyncCapture.setTimeout(() => onVisibleChange?.(false), 20);
      }
    },
    [onBlur, dTrigger, asyncCapture, onVisibleChange]
  );

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      if (dTrigger === 'click') {
        dataRef.current.clearTid && dataRef.current.clearTid();
        onVisibleChange?.(true);
      }
    },
    [onClick, dTrigger, onVisibleChange]
  );

  //#region DidUpdate
  useEffect(() => {
    if (dVisible) {
      if (isUndefined(dZIndex)) {
        if (isFixed) {
          const [key, maxZIndex] = MAX_INDEX_MANAGER.getMaxIndex();
          setZIndex(maxZIndex);
          return () => {
            MAX_INDEX_MANAGER.deleteRecord(key);
          };
        } else {
          setZIndex(toNumber(getComputedStyle(document.body).getPropertyValue(`--${dPrefix}absolute-z-index`)));
        }
      } else {
        setZIndex(dZIndex);
      }
    }
  }, [dPrefix, dVisible, dZIndex, isFixed, setZIndex]);

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
                flushSync(() => onVisibleChange?.(true));
              }, dMouseEnterDelay);
            },
          });
          asyncGroup.fromEvent(triggerRef.current, 'mouseleave').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              dataRef.current.clearTid = asyncCapture.setTimeout(() => {
                dataRef.current.clearTid = null;
                if (checkMouseLeave()) {
                  flushSync(() => onVisibleChange?.(false));
                } else {
                  dataRef.current.hasCancelLeave = true;
                }
              }, dMouseLeaveDelay);
            },
          });
        }

        if (dTrigger === 'focus') {
          asyncGroup.fromEvent(triggerRef.current, 'focus').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              flushSync(() => onVisibleChange?.(true));
            },
          });
          asyncGroup.fromEvent(triggerRef.current, 'blur').subscribe({
            next: () => {
              dataRef.current.clearTid = asyncCapture.setTimeout(() => flushSync(() => onVisibleChange?.(false)), 20);
            },
          });
        }

        if (dTrigger === 'click') {
          asyncGroup.fromEvent(triggerRef.current, 'click').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              flushSync(() => onVisibleChange?.(!dVisible));
            },
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, checkMouseLeave, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, dTriggerEl, dVisible, onVisibleChange, triggerRef]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dVisible && dTrigger === 'click') {
      asyncGroup.fromEvent(window, 'click', { capture: true }).subscribe({
        next: () => {
          dataRef.current.clearTid = asyncCapture.setTimeout(() => {
            flushSync(() => onVisibleChange?.(false));
          }, 20);
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, dTrigger, dVisible, onVisibleChange]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (dVisible && triggerRef.current && popupEl) {
      if (!isFixed && rootContentRef.current) {
        asyncGroup.onResize(rootContentRef.current, updatePosition);
      }

      asyncGroup.onResize(popupEl, updatePosition);

      asyncGroup.onResize(triggerRef.current, updatePosition);

      asyncGroup.onGlobalScroll(updatePosition);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, dVisible, updatePosition, triggerRef, popupEl, rootContentRef, isFixed]);
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
          onVisibleChange?.(true);
        }, dMouseEnterDelay);
      };
      _triggerRenderProps.onMouseLeave = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          dataRef.current.clearTid = null;
          if (checkMouseLeave()) {
            onVisibleChange?.(false);
          } else {
            dataRef.current.hasCancelLeave = true;
          }
        }, dMouseLeaveDelay);
      };
    }
    if (dTrigger === 'focus') {
      _triggerRenderProps.onFocus = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        onVisibleChange?.(true);
      };
      _triggerRenderProps.onBlur = () => {
        dataRef.current.clearTid = asyncCapture.setTimeout(() => onVisibleChange?.(false), 20);
      };
    }
    if (dTrigger === 'click') {
      _triggerRenderProps.onClick = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        onVisibleChange?.(!dVisible);
      };
    }

    return _triggerRenderProps;
  }, [asyncCapture, checkMouseLeave, dMouseEnterDelay, dMouseLeaveDelay, dPrefix, dTrigger, dVisible, id, onVisibleChange]);

  return (
    <>
      {dTriggerRender?.(triggerRenderProps)}
      <DTransition
        dEl={popupEl}
        dVisible={dVisible}
        dCallbackList={{
          beforeEnter: (el) => {
            if (hoverReferenceEl) {
              const rect = el.getBoundingClientRect();
              hoverReferenceEl.style.width = rect.width + 'px';
              hoverReferenceEl.style.height = rect.height + 'px';
              dataRef.current.hasCancelLeave = false;
            }
            updatePosition();

            return dataRef.current.transitionState;
          },
          afterEnter: () => {
            if (dataRef.current.hasCancelLeave && checkMouseLeave()) {
              onVisibleChange?.(false);
            }
            afterVisibleChange?.(true);
          },
          beforeLeave: () => dataRef.current.transitionState,
          afterLeave: () => {
            afterVisibleChange?.(false);
          },
        }}
        dRender={(hidden) =>
          !(dDestroy && hidden) &&
          dPopupContent &&
          containerRef.current &&
          ReactDOM.createPortal(
            <>
              <div
                {...restProps}
                ref={popupRef}
                className={getClassName(className, `${dPrefix}popup`, `${dPrefix}popup--` + placement)}
                style={mergeStyle(style, {
                  ...popupPositionStyle,
                  display: hidden ? 'none' : undefined,
                  zIndex,
                })}
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
                      [`${dPrefix}popup__arrow--custom`]: arrowPosition,
                    })}
                    style={arrowPosition}
                  ></div>
                )}
                {dPopupContent}
              </div>
              {dTrigger === 'hover' && (
                <div ref={hoverReferenceRef} style={{ ...popupPositionStyle, visibility: 'hidden' }} aria-hidden="true"></div>
              )}
            </>,
            containerRef.current
          )
        }
      />
    </>
  );
});
