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

export interface DPopupProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
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
  dCustomPopup?: (popupEl: HTMLElement, targetEl: HTMLElement) => { top: number; left: number; stateList: DTransitionStateList };
  dTriggerNode: React.ReactNode;
  onTrigger?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export interface DPopupRef {
  el: HTMLDivElement | null;
  targetEl: { current: HTMLElement | null };
  updatePosition: () => void;
}

export const DPopup = React.forwardRef<DPopupRef, DPopupProps>((props, ref) => {
  const {
    dVisible,
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
    dTriggerNode,
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

  const [visible, setVisible] = useManualOrAutoState(false, dVisible, onTrigger);

  const [autoPlacement, setAutoPlacement] = useImmer<DPlacement>(dPlacement);

  const targetEl = useElement(`[data-${dPrefix}popup-target="${id}"]`);

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
      return targetEl.current?.parentElement ?? null;
    }
    return null;
  }, [dContainer, dPrefix, targetEl]);
  const containerEl = useElement(dContainer, handleContainer);

  const placement = dAutoPlace ? autoPlacement : dPlacement;

  const updatePosition = useCallback(() => {
    if (transitionRefContent && popupEl && targetEl.current && containerEl.current) {
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
          const position = getPopupPlacementStyle(popupEl, targetEl.current, dPlacement, dDistance, fixed, space);
          if (position) {
            currentPlacement = position.placement;
            setAutoPlacement(position.placement);
            setPopupPositionStyle({
              position: fixed ? 'fixed' : 'absolute',
              top: position.top,
              left: position.left,
            });
          } else {
            const position = getPopupPlacementStyle(popupEl, targetEl.current, autoPlacement, dDistance, fixed);
            setPopupPositionStyle({
              position: fixed ? 'fixed' : 'absolute',
              top: position.top,
              left: position.left,
            });
          }
        } else {
          const position = getPopupPlacementStyle(popupEl, targetEl.current, dPlacement, dDistance, fixed);
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
        const { top, left, stateList } = dCustomPopup(popupEl, targetEl.current);
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
    targetEl,
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
          setVisible(true);
        }, dMouseEnterDelay);
      }
    },
    [asyncCapture, currentData, dMouseEnterDelay, dTrigger, onMouseEnter, setVisible]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      onMouseLeave?.(e);

      if (dTrigger === 'hover') {
        currentData.tid && asyncCapture.clearTimeout(currentData.tid);
        currentData.tid = asyncCapture.setTimeout(() => {
          currentData.tid = null;
          setVisible(false);
        }, dMouseLeaveDelay);
      }
    },
    [asyncCapture, currentData, dMouseLeaveDelay, dTrigger, onMouseLeave, setVisible]
  );

  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);

      if (dTrigger === 'focus') {
        currentData.tid && asyncCapture.clearTimeout(currentData.tid);
        setVisible(true);
      }
    },
    [asyncCapture, currentData, dTrigger, onFocus, setVisible]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);

      if (dTrigger === 'focus') {
        currentData.tid = asyncCapture.setTimeout(() => setVisible(false), 20);
      }
    },
    [asyncCapture, currentData, dTrigger, onBlur, setVisible]
  );

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      if (dTrigger === 'click') {
        currentData.tid && asyncCapture.clearTimeout(currentData.tid);
        setVisible(true);
      }
    },
    [asyncCapture, currentData, dTrigger, onClick, setVisible]
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
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dTrigger === 'click') {
      asyncGroup.fromEvent(document, 'click', { capture: true }).subscribe({
        next: () => {
          currentData.tid = asyncGroup.setTimeout(() => {
            setVisible(false);
          }, 20);
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, currentData, dTrigger, setVisible]);

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
    if (visible && targetEl.current && transitionRefContent) {
      asyncGroup.onResize(targetEl.current, () => transitionRefContent.transitionThrottle.run(updatePosition));
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, transitionRefContent, targetEl, visible, updatePosition]);

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
      targetEl,
      updatePosition,
    }),
    [popupEl, targetEl, updatePosition]
  );

  const triggerNode = useMemo(() => {
    const _triggerNode = React.Children.only(dTriggerNode) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    return React.cloneElement<React.HTMLAttributes<HTMLElement>>(_triggerNode, {
      ..._triggerNode.props,
      [`data-${dPrefix}popup-target`]: id,
      onMouseEnter: (e) => {
        _triggerNode.props.onMouseEnter?.(e);

        if (dTrigger === 'hover') {
          currentData.tid && asyncCapture.clearTimeout(currentData.tid);
          currentData.tid = asyncCapture.setTimeout(() => {
            currentData.tid = null;
            setVisible(true);
          }, dMouseEnterDelay);
        }
      },
      onMouseLeave: (e) => {
        _triggerNode.props.onMouseLeave?.(e);

        if (dTrigger === 'hover') {
          currentData.tid && asyncCapture.clearTimeout(currentData.tid);
          currentData.tid = asyncCapture.setTimeout(() => {
            currentData.tid = null;
            setVisible(false);
          }, dMouseLeaveDelay);
        }
      },
      onFocus: (e) => {
        _triggerNode.props.onFocus?.(e);

        if (dTrigger === 'focus') {
          currentData.tid && asyncCapture.clearTimeout(currentData.tid);
          setVisible(true);
        }
      },
      onBlur: (e) => {
        _triggerNode.props.onBlur?.(e);

        if (dTrigger === 'focus') {
          currentData.tid = asyncCapture.setTimeout(() => setVisible(false), 20);
        }
      },
      onClick: (e) => {
        _triggerNode.props.onClick?.(e);

        if (dTrigger === 'click') {
          currentData.tid && asyncCapture.clearTimeout(currentData.tid);
          setVisible(undefined, true);
        }
      },
    });
  }, [asyncCapture, currentData, dMouseEnterDelay, dMouseLeaveDelay, dPrefix, dTrigger, dTriggerNode, id, setVisible]);

  return (
    <>
      {triggerNode}
      {children &&
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
              {children}
            </div>
          </DTransition>,
          containerEl.current
        )}
    </>
  );
});
