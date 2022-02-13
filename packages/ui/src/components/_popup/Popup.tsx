import type { DElementSelector } from '../../hooks/element';
import type { DTransitionStateList } from '../../hooks/transition';
import type { DPlacement } from '../../utils/position';

import { isUndefined } from 'lodash';
import React, { useId, useEffect, useRef, useState, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';
import { filter } from 'rxjs';

import {
  usePrefixConfig,
  useAsync,
  useElement,
  useRefCallback,
  useDTransition,
  useMaxIndex,
  useContentSVChangeConfig,
  useEventCallback,
  useIsomorphicLayoutEffect,
  useForceUpdate,
  useCallbackWithCondition,
  useCallbackWithState,
} from '../../hooks';
import { getClassName, getPopupPlacementStyle, mergeStyle } from '../../utils';

export interface DTriggerRenderProps {
  [key: `data-${string}popup-trigger`]: string;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface DPopupRef {
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
  dEscClosable?: boolean;
  dCustomPopup?: (
    popupEl: HTMLElement,
    triggerEl: HTMLElement
  ) => { top: number; left: number; stateList: DTransitionStateList; arrowStyle?: React.CSSProperties };
  onVisibleChange?: (visible: boolean) => void;
  onRendered?: () => void;
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
    dEscClosable = true,
    dCustomPopup,
    onVisibleChange,
    onRendered,
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
  const onContentSVChange$ = useContentSVChangeConfig();
  //#endregion

  //#region Ref
  const [popupEl, popupRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const dataRef = useRef<{
    transitionState: DTransitionStateList;
    clearTid?: () => void;
  }>({
    transitionState: {},
  });

  const asyncCapture = useAsync();
  const forceUpdate = useForceUpdate();
  const uniqueId = useId();

  const [rendered, setRendered] = useState(dVisible);
  useIsomorphicLayoutEffect(() => {
    if (!dVisible) {
      setRendered(false);
    }
  }, [dVisible]);
  const popupRendered = dVisible && rendered;

  const triggerEl = useElement(isUndefined(dTriggerEl) ? `[data-${dPrefix}popup-trigger="${uniqueId}"]` : dTriggerEl);
  const isFixed = isUndefined(dContainer);
  const containerEl = useElement(dContainer, () => {
    if (isFixed) {
      let el = document.getElementById(`${dPrefix}popup-root`);
      if (!el) {
        el = document.createElement('div');
        el.id = `${dPrefix}popup-root`;
        document.body.appendChild(el);
      }
      return el;
    } else if (dContainer === false) {
      return triggerEl?.parentElement ?? null;
    }
    return null;
  });

  const changeVisible = useEventCallback((visiable: boolean | 'reverse') => {
    if (visiable === 'reverse') {
      onVisibleChange?.(!dVisible);
    } else {
      if (!Object.is(dVisible, visiable)) {
        onVisibleChange?.(visiable);
      }
    }
  });

  const updatePosition = useCallbackWithState<{
    popupPositionStyle: React.CSSProperties;
    arrowStyle?: React.CSSProperties;
    autoPlacement: DPlacement;
  }>(
    (draft) => {
      if (popupEl && triggerEl && containerEl) {
        if (isUndefined(dCustomPopup)) {
          draft.arrowStyle = undefined;
          let currentPlacement = dAutoPlace ? dPlacement : draft.autoPlacement;

          if (dAutoPlace) {
            let space: [number, number, number, number] = [0, 0, 0, 0];
            if (!isFixed) {
              const containerRect = containerEl.getBoundingClientRect();
              space = [
                containerRect.top,
                window.innerWidth - containerRect.left - containerRect.width,
                window.innerHeight - containerRect.top - containerRect.height,
                containerRect.left,
              ];
            }
            const position = getPopupPlacementStyle(popupEl, triggerEl, dPlacement, dDistance, isFixed, space);
            if (position) {
              currentPlacement = position.placement;
              draft.autoPlacement = position.placement;
              draft.popupPositionStyle = {
                position: isFixed ? 'fixed' : 'absolute',
                top: position.top,
                left: position.left,
              };
            } else {
              const position = getPopupPlacementStyle(popupEl, triggerEl, draft.autoPlacement, dDistance, isFixed);
              draft.popupPositionStyle = {
                position: isFixed ? 'fixed' : 'absolute',
                top: position.top,
                left: position.left,
              };
            }
          } else {
            const position = getPopupPlacementStyle(popupEl, triggerEl, dPlacement, dDistance, isFixed);
            draft.popupPositionStyle = {
              position: isFixed ? 'fixed' : 'absolute',
              top: position.top,
              left: position.left,
            };
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
          const { top, left, stateList, arrowStyle } = dCustomPopup(popupEl, triggerEl);
          draft.arrowStyle = arrowStyle;
          draft.popupPositionStyle = {
            position: isFixed ? 'fixed' : 'absolute',
            top,
            left,
          };
          dataRef.current.transitionState = stateList;
        }
      }
    },
    {
      popupPositionStyle: {},
      autoPlacement: dPlacement,
    }
  );
  const { popupPositionStyle, arrowStyle, autoPlacement } = useCallbackWithCondition(popupRendered, updatePosition)();
  const placement = dAutoPlace ? autoPlacement : dPlacement;

  const hidden = useDTransition({
    dEl: popupEl,
    dVisible,
    dCallbackList: {
      beforeEnter: () => {
        updatePosition();
        setRendered(true);
        onRendered?.();

        return dataRef.current.transitionState;
      },
      beforeLeave: () => dataRef.current.transitionState,
    },
    afterEnter: () => {
      afterVisibleChange?.(true);
    },
    afterLeave: () => {
      afterVisibleChange?.(false);
    },
  });

  const maxZIndex = useMaxIndex(!hidden);
  const zIndex = (() => {
    if (!hidden) {
      if (isUndefined(dZIndex)) {
        if (isFixed) {
          return maxZIndex;
        } else {
          return `var(--${dPrefix}zindex-absolute)`;
        }
      } else {
        return dZIndex;
      }
    }
  })();

  useEffect(() => {
    if (!isUndefined(dTriggerEl)) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();
      if (triggerEl) {
        if (dTrigger === 'hover') {
          asyncGroup.fromEvent(triggerEl, 'mouseenter').subscribe({
            next: () => {
              dataRef.current.clearTid?.();
              dataRef.current.clearTid = asyncCapture.setTimeout(() => {
                changeVisible(true);
              }, dMouseEnterDelay);
            },
          });
          asyncGroup.fromEvent(triggerEl, 'mouseleave').subscribe({
            next: () => {
              dataRef.current.clearTid?.();
              dataRef.current.clearTid = asyncCapture.setTimeout(() => {
                changeVisible(false);
              }, dMouseLeaveDelay);
            },
          });
        }

        if (dTrigger === 'focus') {
          asyncGroup.fromEvent(triggerEl, 'focus').subscribe({
            next: () => {
              dataRef.current.clearTid?.();
              changeVisible(true);
            },
          });
          asyncGroup.fromEvent(triggerEl, 'blur').subscribe({
            next: () => {
              dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(false), 20);
            },
          });
        }

        if (dTrigger === 'click') {
          asyncGroup.fromEvent(triggerEl, 'click').subscribe({
            next: () => {
              dataRef.current.clearTid?.();
              changeVisible('reverse');
            },
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, changeVisible, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, dTriggerEl, triggerEl]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dVisible && dTrigger === 'click') {
      asyncGroup.fromEvent(window, 'click', { capture: true }).subscribe({
        next: () => {
          dataRef.current.clearTid = asyncCapture.setTimeout(() => {
            changeVisible(false);
          }, 20);
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, changeVisible, dTrigger, dVisible]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dVisible && dEscClosable) {
      asyncGroup
        .fromEvent<KeyboardEvent>(window, 'keydown')
        .pipe(filter((e) => e.code === 'Escape'))
        .subscribe({
          next: () => {
            changeVisible(false);
          },
        });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, changeVisible, dEscClosable, dVisible]);

  useEffect(() => {
    if (popupRendered) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();
      if (popupEl) {
        asyncGroup.onResize(popupEl, () => {
          forceUpdate();
        });
      }
      if (triggerEl) {
        asyncGroup.onResize(triggerEl, () => {
          forceUpdate();
        });
      }

      const ob = onContentSVChange$?.subscribe({
        next: () => {
          forceUpdate();
        },
      });
      asyncGroup.onGlobalScroll(() => {
        forceUpdate();
      });

      return () => {
        ob?.unsubscribe();
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, forceUpdate, onContentSVChange$, popupEl, popupRendered, triggerEl]);

  useImperativeHandle(
    ref,
    () => ({
      updatePosition: () => {
        forceUpdate();
      },
    }),
    [forceUpdate]
  );

  const triggerRenderProps = (() => {
    const triggerRenderProps: DTriggerRenderProps = { [`data-${dPrefix}popup-trigger`]: uniqueId };
    if (dTrigger === 'hover') {
      triggerRenderProps.onMouseEnter = () => {
        dataRef.current.clearTid?.();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          changeVisible(true);
        }, dMouseEnterDelay);
      };
      triggerRenderProps.onMouseLeave = () => {
        dataRef.current.clearTid?.();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          changeVisible(false);
        }, dMouseLeaveDelay);
      };
    }
    if (dTrigger === 'focus') {
      triggerRenderProps.onFocus = () => {
        dataRef.current.clearTid?.();
        changeVisible(true);
      };
      triggerRenderProps.onBlur = () => {
        dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(false), 20);
      };
    }
    if (dTrigger === 'click') {
      triggerRenderProps.onClick = () => {
        dataRef.current.clearTid?.();
        changeVisible('reverse');
      };
    }

    return triggerRenderProps;
  })();

  const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = (e) => {
    onMouseEnter?.(e);

    if (dTrigger === 'hover') {
      dataRef.current.clearTid?.();
      dataRef.current.clearTid = asyncCapture.setTimeout(() => {
        changeVisible(true);
      }, dMouseEnterDelay);
    }
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = (e) => {
    onMouseLeave?.(e);

    if (dTrigger === 'hover') {
      dataRef.current.clearTid?.();
      dataRef.current.clearTid = asyncCapture.setTimeout(() => {
        changeVisible(false);
      }, dMouseLeaveDelay);
    }
  };

  const handleFocus: React.FocusEventHandler<HTMLDivElement> = (e) => {
    onFocus?.(e);

    if (dTrigger === 'focus') {
      dataRef.current.clearTid?.();
      changeVisible(true);
    }
  };

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    onBlur?.(e);

    if (dTrigger === 'focus') {
      dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(false), 20);
    }
  };

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    onClick?.(e);

    if (dTrigger === 'click') {
      dataRef.current.clearTid?.();
      changeVisible(true);
    }
  };

  return (
    <>
      {dTriggerRender?.(triggerRenderProps)}
      {!(dDestroy && hidden) &&
        containerEl &&
        ReactDOM.createPortal(
          <div
            {...restProps}
            ref={popupRef}
            className={getClassName(className, `${dPrefix}popup`, `${dPrefix}popup--` + placement)}
            style={mergeStyle(
              {
                ...popupPositionStyle,
                display: hidden ? 'none' : undefined,
                zIndex,
              },
              style
            )}
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
                  [`${dPrefix}popup__arrow--custom`]: arrowStyle,
                })}
                style={arrowStyle}
              ></div>
            )}
            {dPopupContent}
          </div>,
          containerEl
        )}
    </>
  );
};

export const DPopup = React.forwardRef(Popup);
