import type { DElementSelector } from '../../hooks/element-ref';
import type { DTransitionStateList } from '../../hooks/transition';
import type { DPlacement } from '../../utils/position';

import { isUndefined, toNumber } from 'lodash';
import React, { useId, useCallback, useEffect, useMemo, useImperativeHandle, useRef, useState } from 'react';
import ReactDOM, { flushSync } from 'react-dom';
import { filter } from 'rxjs';

import {
  usePrefixConfig,
  useAsync,
  useRefSelector,
  useImmer,
  useRefCallback,
  useContentRefConfig,
  useDTransition,
  useMaxIndex,
} from '../../hooks';
import { getClassName, getPopupPlacementStyle, mergeStyle } from '../../utils';
import { checkOutEl } from './utils';

export interface DTriggerRenderProps {
  [key: `data-${string}popup-trigger`]: string;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
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
  dEscClose?: boolean;
  dCustomPopup?: (
    popupEl: HTMLElement,
    triggerEl: HTMLElement
  ) => { top: number; left: number; stateList: DTransitionStateList; arrowPosition?: React.CSSProperties };
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const Popup: React.ForwardRefRenderFunction<DPopupRef, DPopupProps> = (props, ref) => {
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
    dEscClose = true,
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
  const rootContentRef = useContentRefConfig();
  //#endregion

  //#region Ref
  const [popupEl, popupRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const dataRef = useRef<{
    clearTid: (() => void) | null;
    hasCancelLeave: boolean;
    transitionState?: DTransitionStateList;
  }>({
    clearTid: null,
    hasCancelLeave: false,
  });

  const asyncCapture = useAsync();
  const [popupPositionStyle, setPopupPositionStyle] = useImmer<React.CSSProperties>({});
  const [arrowPosition, setArrowStyle] = useImmer<React.CSSProperties | undefined>(undefined);
  const uniqueId = useId();

  const [autoPlacement, setAutoPlacement] = useState<DPlacement>(dPlacement);
  const [afterEnter, setAfterEnter] = useState(false);

  const triggerRef = useRefSelector(isUndefined(dTriggerEl) ? `[data-${dPrefix}popup-trigger="${uniqueId}"]` : dTriggerEl);

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

  const changeVisible = useCallback(
    (visiable?: boolean) => {
      if (isUndefined(visiable)) {
        onVisibleChange?.(!dVisible);
      } else {
        if (!Object.is(dVisible, visiable)) {
          onVisibleChange?.(visiable);
        }
      }
    },
    [dVisible, onVisibleChange]
  );

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
          'enter-from': { transform: 'scale(0.3)', opacity: '0' },
          'enter-to': { transition: 'transform 86ms ease-out, opacity 86ms ease-out', transformOrigin },
          'leave-to': {
            transform: 'scale(0.3)',
            opacity: '0',
            transition: 'transform 0.1s ease-in, opacity 0.1s ease-in',
            transformOrigin,
          },
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

  const hidden = useDTransition({
    dEl: popupEl,
    dVisible,
    dCallbackList: {
      beforeEnter: () => {
        dataRef.current.hasCancelLeave = false;
        updatePosition();

        return dataRef.current.transitionState;
      },
      afterEnter: () => {
        updatePosition();
        setAfterEnter(true);
      },
      beforeLeave: () => dataRef.current.transitionState,
      afterLeave: () => {
        setAfterEnter(false);
      },
    },
    afterEnter: () => {
      if (dataRef.current.hasCancelLeave && checkMouseLeave()) {
        changeVisible(false);
      }
      afterVisibleChange?.(true);
    },
    afterLeave: () => {
      afterVisibleChange?.(false);
    },
  });

  const maxZIndex = useMaxIndex(!hidden);
  const zIndex = useMemo(() => {
    if (!hidden) {
      if (isUndefined(dZIndex)) {
        if (isFixed) {
          return maxZIndex;
        } else {
          return toNumber(getComputedStyle(document.body).getPropertyValue(`--${dPrefix}absolute-z-index`));
        }
      } else {
        return dZIndex;
      }
    }
  }, [dPrefix, dZIndex, hidden, isFixed, maxZIndex]);

  // `onMouseEnter` and `onMouseLeave` trigger time is uncertain.
  // Very strange, sometimes popup element emit `onMouseEnter` before
  // trigger element emit `onMouseLeave`.
  // It's also no emit `onMouseEnter` when enter to popup element sometimes.
  const checkMouseLeave = useCallback(() => {
    if (popupEl && triggerRef.current) {
      return checkOutEl(popupEl) && checkOutEl(triggerRef.current);
    }

    return false;
  }, [popupEl, triggerRef]);

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
          if (checkMouseLeave()) {
            changeVisible(false);
          } else {
            dataRef.current.hasCancelLeave = true;
          }
        }, dMouseLeaveDelay);
      }
    },
    [onMouseLeave, dTrigger, asyncCapture, dMouseLeaveDelay, checkMouseLeave, changeVisible]
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
                if (checkMouseLeave()) {
                  flushSync(() => changeVisible(false));
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
              flushSync(() => changeVisible());
            },
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, checkMouseLeave, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, dTriggerEl, changeVisible, triggerRef]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dVisible && dTrigger === 'click') {
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
  }, [asyncCapture, dTrigger, dVisible, changeVisible]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dVisible && dEscClose) {
      asyncGroup
        .fromEvent<KeyboardEvent>(window, 'keydown')
        .pipe(filter((e) => e.code === 'Escape'))
        .subscribe({
          next: () => {
            flushSync(() => changeVisible(false));
          },
        });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, dEscClose, dVisible, changeVisible]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (dVisible && afterEnter) {
      if (popupEl) {
        asyncGroup.onResize(popupEl, updatePosition);
      }
      if (triggerRef.current) {
        asyncGroup.onResize(triggerRef.current, updatePosition);
      }
      if (!isFixed && rootContentRef.current) {
        asyncGroup.onResize(rootContentRef.current, updatePosition);
      }

      asyncGroup.onGlobalScroll(updatePosition);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [afterEnter, asyncCapture, dVisible, isFixed, popupEl, rootContentRef, triggerRef, updatePosition]);
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
    const _triggerRenderProps: DTriggerRenderProps = { [`data-${dPrefix}popup-trigger`]: uniqueId };
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
          if (checkMouseLeave()) {
            changeVisible(false);
          } else {
            dataRef.current.hasCancelLeave = true;
          }
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
        changeVisible();
      };
    }

    return _triggerRenderProps;
  }, [asyncCapture, checkMouseLeave, dMouseEnterDelay, dMouseLeaveDelay, dPrefix, dTrigger, uniqueId, changeVisible]);

  return (
    <>
      {dTriggerRender?.(triggerRenderProps)}
      {!(dDestroy && hidden) &&
        dPopupContent &&
        containerRef.current &&
        ReactDOM.createPortal(
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
          </div>,
          containerRef.current
        )}
    </>
  );
};

export const DPopup = React.forwardRef(Popup);
