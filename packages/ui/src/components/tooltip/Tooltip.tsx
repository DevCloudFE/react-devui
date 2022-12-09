import type { DRefExtra } from '@react-devui/hooks/useRefExtra';
import type { DPopupPlacement } from '@react-devui/utils/position';

import { isUndefined } from 'lodash';
import React, { useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { useEvent, useEventCallback, useId, useRefExtra } from '@react-devui/hooks';
import { getClassName, getPopupPosition } from '@react-devui/utils';

import { useMaxIndex, useDValue } from '../../hooks';
import { checkNoExpandedEl, registerComponentMate } from '../../utils';
import { EXPANDED_DATA } from '../../utils/checkNoExpandedEl';
import { DPopup } from '../_popup';
import { DTransition } from '../_transition';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DTooltipRef {
  updatePosition: () => void;
}

export interface DTooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dVisible?: boolean;
  dTrigger?: 'hover' | 'click';
  dContainer?: DRefExtra | false;
  dPlacement?: DPopupPlacement;
  dEscClosable?: boolean;
  dArrow?: boolean;
  dDistance?: number;
  dInWindow?: number | false;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dZIndex?: number | string;
  dTitle: React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const TTANSITION_DURING = { enter: 86, leave: 100 };
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTooltip' as const });
function Tooltip(props: DTooltipProps, ref: React.ForwardedRef<DTooltipRef>): JSX.Element | null {
  const {
    children,
    dVisible,
    dTrigger = 'hover',
    dContainer,
    dPlacement = 'top',
    dEscClosable = true,
    dArrow = true,
    dDistance = 10,
    dInWindow = false,
    dMouseEnterDelay = 150,
    dMouseLeaveDelay = 200,
    dZIndex,
    dTitle,
    onVisibleChange,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const windowRef = useRefExtra(() => window);
  const triggerRef = useRefExtra<HTMLElement>(() => document.querySelector(`[aria-describedby="${id}"]`));
  const popupRef = useRef<HTMLDivElement>(null);
  const containerRef = useRefExtra(
    isUndefined(dContainer)
      ? () => {
          let el = document.getElementById(`${dPrefix}tooltip-root`);
          if (!el) {
            el = document.createElement('div');
            el.id = `${dPrefix}tooltip-root`;
            document.body.appendChild(el);
          }
          return el;
        }
      : dContainer === false
      ? () => {
          return triggerRef.current?.parentElement ?? null;
        }
      : dContainer,
    true
  );
  //#endregion

  const uniqueId = useId();
  const id = restProps.id ?? `${dPrefix}tooltip-${uniqueId}`;

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);

  const maxZIndex = useMaxIndex(visible);
  const zIndex = (() => {
    if (isUndefined(dZIndex)) {
      if (isUndefined(dContainer)) {
        return maxZIndex;
      } else {
        return `var(--${dPrefix}zindex-absolute)`;
      }
    } else {
      return dZIndex;
    }
  })();

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: '-200vh',
    left: '-200vw',
  });
  const [placement, setPlacement] = useState<DPopupPlacement>(dPlacement);
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    if (visible && popupRef.current && triggerRef.current) {
      let currentPlacement = dPlacement;

      let space: [number, number, number, number] = [0, 0, 0, 0];
      if (!isUndefined(dContainer) && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        space = [
          containerRect.top,
          window.innerWidth - containerRect.left - containerRect.width,
          window.innerHeight - containerRect.top - containerRect.height,
          containerRect.left,
        ];
      }
      const position = getPopupPosition(
        popupRef.current,
        triggerRef.current,
        {
          placement: dPlacement,
          offset: dDistance,
          inWindow: dInWindow,
        },
        space
      );
      if (position) {
        currentPlacement = position.placement;
        setPlacement(position.placement);
        setPopupPositionStyle({
          top: position.top,
          left: position.left,
        });
      } else {
        const position = getPopupPosition(popupRef.current, triggerRef.current, {
          placement,
          offset: dDistance,
          inWindow: dInWindow,
        });
        setPopupPositionStyle({
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
      setTransformOrigin(transformOrigin);
    }
  });

  useEvent<KeyboardEvent>(
    windowRef,
    'keydown',
    (e) => {
      if (e.code === 'Escape' && popupRef.current && checkNoExpandedEl(popupRef.current)) {
        changeVisible(false);
      }
    },
    {},
    !dEscClosable || !visible
  );

  useImperativeHandle(
    ref,
    () => ({
      updatePosition,
    }),
    [updatePosition]
  );

  return (
    <DPopup
      dVisible={visible}
      dTrigger={dTrigger}
      dMouseEnterDelay={dMouseEnterDelay}
      dMouseLeaveDelay={dMouseLeaveDelay}
      dUpdatePosition={{
        fn: updatePosition,
        triggerRef,
        popupRef,
        extraScrollRefs: [isUndefined(dContainer) ? undefined : containerRef],
      }}
      onVisibleChange={changeVisible}
    >
      {({ renderTrigger, renderPopup }) => (
        <>
          {renderTrigger(
            React.cloneElement(children, {
              'aria-describedby': id,
              [EXPANDED_DATA]: visible,
            })
          )}
          {containerRef.current &&
            ReactDOM.createPortal(
              <DTransition
                dIn={visible}
                dDuring={TTANSITION_DURING}
                onEnter={updatePosition}
                afterEnter={() => {
                  afterVisibleChange?.(true);
                }}
                afterLeave={() => {
                  afterVisibleChange?.(false);
                }}
              >
                {(state) => {
                  let transitionStyle: React.CSSProperties = {};
                  switch (state) {
                    case 'enter':
                      transitionStyle = { transform: 'scale(0.3)', opacity: 0 };
                      break;

                    case 'entering':
                      transitionStyle = {
                        transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING.enter}ms ease-out`).join(', '),
                        transformOrigin,
                      };
                      break;

                    case 'leaving':
                      transitionStyle = {
                        transform: 'scale(0.3)',
                        opacity: 0,
                        transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING.leave}ms ease-in`).join(', '),
                        transformOrigin,
                      };
                      break;

                    case 'leaved':
                      transitionStyle = { display: 'none' };
                      break;

                    default:
                      break;
                  }

                  return renderPopup(
                    <div
                      {...restProps}
                      ref={popupRef}
                      id={id}
                      className={getClassName(restProps.className, `${dPrefix}tooltip`, `${dPrefix}tooltip--` + placement)}
                      style={{
                        ...restProps.style,
                        ...popupPositionStyle,
                        zIndex,
                        ...transitionStyle,
                      }}
                      role="tooltip"
                    >
                      {dArrow && <div className={`${dPrefix}tooltip__arrow`}></div>}
                      {dTitle}
                    </div>
                  );
                }}
              </DTransition>,
              containerRef.current
            )}
        </>
      )}
    </DPopup>
  );
}

export const DTooltip = React.forwardRef(Tooltip);
