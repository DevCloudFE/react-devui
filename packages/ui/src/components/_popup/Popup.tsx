import type { DElementSelector } from '../../hooks/element';
import type { DPlacement } from '../../utils/position';
import type { DTransitionStateList, DTransitionRef } from '../_transition';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useImperativeHandle, useState } from 'react';
import ReactDOM from 'react-dom';
import { useImmer } from 'use-immer';

import { useDPrefixConfig, useCustomRef, useAsync, useElement, useManualOrAutoState, useId } from '../../hooks';
import { getClassName, globalMaxIndexManager, globalScrollCapture, getPopupPlacementStyle } from '../../utils';
import { DTransition } from '../_transition';

export interface DPopupRef {
  el: HTMLDivElement | null;
  triggerEl: { current: HTMLElement | null };
  updatePosition: () => void;
}

export interface DPopupProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dPopupContent: React.ReactNode;
  dContainer?: DElementSelector | false;
  dTriggerNode?: DElementSelector;
  dPlacement?: DPlacement;
  dAutoPlace?: boolean;
  dTrigger?: 'hover' | 'focus' | 'click' | null;
  dDistance?: number;
  dArrow?: boolean;
  dZIndex?: number;
  dDestroy?: boolean;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dCustomPopup?: (popupEl: HTMLElement, triggerEl: HTMLElement) => { top: number; left: number; stateList: DTransitionStateList };
  onTrigger?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export const DPopup = React.forwardRef<DPopupRef, DPopupProps>((props, ref) => {
  const {
    dVisible,
    dPopupContent,
    dContainer,
    dTriggerNode,
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
    onTrigger,
    afterVisibleChange,
    className,
    style,
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
  const [transitionRefContent, transitionRef] = useCustomRef<DTransitionRef>();
  const [popupEl, popupRef] = useCustomRef<HTMLDivElement>();
  //#endregion

  const [currentData] = useState<{ tid: number | null }>({
    tid: null,
  });

  const asyncCapture = useAsync();
  const [popupPositionStyle, setPopupPositionStyle] = useImmer<React.CSSProperties>({});
  const [zIndex, setZIndex] = useImmer(1000);
  const id = useId();

  const [visible, dispatchVisible] = useManualOrAutoState(false, dVisible, onTrigger);

  const [autoPlacement, setAutoPlacement] = useImmer<DPlacement>(dPlacement);

  const triggerEl = useElement(isUndefined(dTriggerNode) ? `[data-${dPrefix}popup-trigger="${id}"]` : dTriggerNode);

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
      return triggerEl.current?.parentElement ?? null;
    }
    return null;
  }, [dContainer, dPrefix, triggerEl]);
  const containerEl = useElement(dContainer, handleContainer);

  const placement = dAutoPlace ? autoPlacement : dPlacement;

  const updatePosition = useCallback(() => {
    if (transitionRefContent && popupEl && triggerEl.current && containerEl.current) {
      const fixed = isUndefined(dContainer);

      if (isUndefined(dCustomPopup)) {
        let currentPlacement = dAutoPlace ? dPlacement : autoPlacement;

        if (dAutoPlace) {
          let space: [number, number, number, number] = [0, 0, 0, 0];
          if (!fixed) {
            const containerRect = containerEl.current.getBoundingClientRect();
            space = [
              containerRect.top,
              window.innerWidth - containerRect.left - containerRect.width,
              window.innerHeight - containerRect.top - containerRect.height,
              containerRect.left,
            ];
          }
          const position = getPopupPlacementStyle(popupEl, triggerEl.current, dPlacement, dDistance, fixed, space);
          if (position) {
            currentPlacement = position.placement;
            setAutoPlacement(position.placement);
            setPopupPositionStyle({
              position: fixed ? 'fixed' : 'absolute',
              top: position.top,
              left: position.left,
            });
          } else {
            const position = getPopupPlacementStyle(popupEl, triggerEl.current, autoPlacement, dDistance, fixed);
            setPopupPositionStyle({
              position: fixed ? 'fixed' : 'absolute',
              top: position.top,
              left: position.left,
            });
          }
        } else {
          const position = getPopupPlacementStyle(popupEl, triggerEl.current, dPlacement, dDistance, fixed);
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
        const { top, left, stateList } = dCustomPopup(popupEl, triggerEl.current);
        setPopupPositionStyle({
          position: fixed ? 'fixed' : 'absolute',
          top,
          left,
        });
        return stateList;
      }
    }
  }, [
    transitionRefContent,
    popupEl,
    triggerEl,
    containerEl,
    dContainer,
    dCustomPopup,
    dAutoPlace,
    dPlacement,
    autoPlacement,
    dDistance,
    setAutoPlacement,
    setPopupPositionStyle,
  ]);

  const handleMouseEnter = useCallback(
    (e) => {
      onMouseEnter?.(e);

      if (dTrigger === 'hover') {
        currentData.tid && asyncCapture.clearTimeout(currentData.tid);
        currentData.tid = asyncCapture.setTimeout(() => {
          currentData.tid = null;
          dispatchVisible({ value: true });
        }, dMouseEnterDelay);
      }
    },
    [asyncCapture, currentData, dMouseEnterDelay, dTrigger, onMouseEnter, dispatchVisible]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      onMouseLeave?.(e);

      if (dTrigger === 'hover') {
        currentData.tid && asyncCapture.clearTimeout(currentData.tid);
        currentData.tid = asyncCapture.setTimeout(() => {
          currentData.tid = null;
          dispatchVisible({ value: false });
        }, dMouseLeaveDelay);
      }
    },
    [asyncCapture, currentData, dMouseLeaveDelay, dTrigger, onMouseLeave, dispatchVisible]
  );

  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);

      if (dTrigger === 'focus') {
        currentData.tid && asyncCapture.clearTimeout(currentData.tid);
        dispatchVisible({ value: true });
      }
    },
    [asyncCapture, currentData, dTrigger, onFocus, dispatchVisible]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);

      if (dTrigger === 'focus') {
        currentData.tid = asyncCapture.setTimeout(() => dispatchVisible({ value: false }), 20);
      }
    },
    [asyncCapture, currentData, dTrigger, onBlur, dispatchVisible]
  );

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      if (dTrigger === 'click') {
        currentData.tid && asyncCapture.clearTimeout(currentData.tid);
        dispatchVisible({ value: true });
      }
    },
    [asyncCapture, currentData, dTrigger, onClick, dispatchVisible]
  );

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
  }, [dVisible, dContainer, dZIndex, setZIndex]);

  useEffect(() => {
    if (!isUndefined(dTriggerNode)) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();
      if (triggerEl.current) {
        if (dTrigger === 'hover') {
          asyncGroup.fromEvent(triggerEl.current, 'mouseenter').subscribe({
            next: () => {
              currentData.tid && asyncGroup.clearTimeout(currentData.tid);
              currentData.tid = asyncGroup.setTimeout(() => {
                currentData.tid = null;
                dispatchVisible({ value: true });
              }, dMouseEnterDelay);
            },
          });
          asyncGroup.fromEvent(triggerEl.current, 'mouseleave').subscribe({
            next: () => {
              currentData.tid && asyncGroup.clearTimeout(currentData.tid);
              currentData.tid = asyncGroup.setTimeout(() => {
                currentData.tid = null;
                dispatchVisible({ value: false });
              }, dMouseLeaveDelay);
            },
          });
        }

        if (dTrigger === 'focus') {
          asyncGroup.fromEvent(triggerEl.current, 'focus').subscribe({
            next: () => {
              currentData.tid && asyncGroup.clearTimeout(currentData.tid);
              dispatchVisible({ value: true });
            },
          });
          asyncGroup.fromEvent(triggerEl.current, 'blur').subscribe({
            next: () => {
              currentData.tid = asyncCapture.setTimeout(() => dispatchVisible({ value: false }), 20);
            },
          });
        }

        if (dTrigger === 'click') {
          asyncGroup.fromEvent(triggerEl.current, 'click').subscribe({
            next: () => {
              currentData.tid && asyncGroup.clearTimeout(currentData.tid);
              dispatchVisible({ reverse: true });
            },
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, currentData, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, dTriggerNode, dispatchVisible, triggerEl]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dTrigger === 'click') {
      asyncGroup.fromEvent(document, 'click', { capture: true }).subscribe({
        next: () => {
          currentData.tid = asyncGroup.setTimeout(() => {
            dispatchVisible({ value: false });
          }, 20);
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, currentData, dTrigger, dispatchVisible]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (visible && transitionRefContent && popupEl) {
      asyncGroup.onResize(popupEl, () => transitionRefContent.transitionThrottle.run(updatePosition));
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, visible, transitionRefContent, updatePosition, popupEl]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (visible && triggerEl.current && transitionRefContent) {
      asyncGroup.onResize(triggerEl.current, () => transitionRefContent.transitionThrottle.run(updatePosition));
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, transitionRefContent, triggerEl, visible, updatePosition]);

  useEffect(() => {
    if (visible && transitionRefContent) {
      const tid = globalScrollCapture.addTask(() => transitionRefContent.transitionThrottle.run(updatePosition));
      return () => {
        globalScrollCapture.deleteTask(tid);
      };
    }
  }, [visible, transitionRefContent, updatePosition]);

  useEffect(() => {
    if (transitionRefContent) {
      transitionRefContent.transitionThrottle.run(updatePosition);
    }
  }, [transitionRefContent, updatePosition]);
  //#endregion

  useImperativeHandle(
    ref,
    () => ({
      el: popupEl,
      triggerEl,
      updatePosition,
    }),
    [popupEl, triggerEl, updatePosition]
  );

  const child = useMemo(() => {
    if (isUndefined(dTriggerNode)) {
      const _child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
      let triggerProps: React.HTMLAttributes<HTMLElement> = {};
      if (dTrigger === 'hover') {
        triggerProps = {
          onMouseEnter: (e) => {
            _child.props.onMouseEnter?.(e);

            currentData.tid && asyncCapture.clearTimeout(currentData.tid);
            currentData.tid = asyncCapture.setTimeout(() => {
              currentData.tid = null;
              dispatchVisible({ value: true });
            }, dMouseEnterDelay);
          },
          onMouseLeave: (e) => {
            _child.props.onMouseLeave?.(e);

            currentData.tid && asyncCapture.clearTimeout(currentData.tid);
            currentData.tid = asyncCapture.setTimeout(() => {
              currentData.tid = null;
              dispatchVisible({ value: false });
            }, dMouseLeaveDelay);
          },
        };
      }
      if (dTrigger === 'focus') {
        triggerProps = {
          onFocus: (e) => {
            _child.props.onFocus?.(e);

            currentData.tid && asyncCapture.clearTimeout(currentData.tid);
            dispatchVisible({ value: true });
          },
          onBlur: (e) => {
            _child.props.onBlur?.(e);

            currentData.tid = asyncCapture.setTimeout(() => dispatchVisible({ value: false }), 20);
          },
        };
      }
      if (dTrigger === 'click') {
        triggerProps = {
          onClick: (e) => {
            _child.props.onClick?.(e);

            currentData.tid && asyncCapture.clearTimeout(currentData.tid);
            dispatchVisible({ reverse: true });
          },
        };
      }

      return React.cloneElement<React.HTMLAttributes<HTMLElement>>(_child, {
        ..._child.props,
        ...triggerProps,
        [`data-${dPrefix}popup-trigger`]: id,
      });
    }

    return null;
  }, [dTriggerNode, children, dTrigger, dPrefix, id, currentData, asyncCapture, dMouseEnterDelay, dispatchVisible, dMouseLeaveDelay]);

  return (
    <>
      {child}
      {dPopupContent &&
        containerEl.current &&
        ReactDOM.createPortal(
          <DTransition
            ref={transitionRef}
            dEl={popupEl}
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
            dDestroy={dDestroy}
          >
            <div
              {...restProps}
              ref={popupRef}
              className={getClassName(className, `${dPrefix}popup`, `${dPrefix}popup--` + placement)}
              style={{
                ...style,
                ...popupPositionStyle,
                zIndex,
              }}
              tabIndex={-1}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onClick={handleClick}
            >
              {dArrow && <div className={`${dPrefix}popup__arrow`}></div>}
              {dPopupContent}
            </div>
          </DTransition>,
          containerEl.current
        )}
    </>
  );
});
