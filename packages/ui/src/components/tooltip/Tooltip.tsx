import type { DElementSelector } from '../../hooks/ui/useElement';
import type { DPopupPlacement } from '../../utils/position';

import { isUndefined } from 'lodash';
import React, { useId, useImperativeHandle, useRef, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useEventCallback, useElement, useMaxIndex, useDValue } from '../../hooks';
import { registerComponentMate, getClassName, getPopupPosition } from '../../utils';
import { DPopup } from '../_popup';
import { DTransition } from '../_transition';

export interface DTooltipRef {
  updatePosition: () => void;
}

export interface DTooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dVisible?: boolean;
  dTrigger?: 'hover' | 'click';
  dTitle: React.ReactNode;
  dContainer?: DElementSelector | false;
  dPlacement?: DPopupPlacement;
  dEscClosable?: boolean;
  dArrow?: boolean;
  dDisabled?: boolean;
  dDistance?: number;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dZIndex?: number | string;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const TTANSITION_DURING = { enter: 86, leave: 100 };
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTooltip' });
function Tooltip(props: DTooltipProps, ref: React.ForwardedRef<DTooltipRef>): JSX.Element | null {
  const {
    children,
    dVisible,
    dTrigger = 'hover',
    dTitle,
    dContainer,
    dPlacement = 'top',
    dEscClosable = true,
    dArrow = true,
    dDisabled = false,
    dDistance = 10,
    dMouseEnterDelay = 150,
    dMouseLeaveDelay = 200,
    dZIndex,
    onVisibleChange,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const popupRef = useRef<HTMLDivElement>(null);
  //#endregion

  const uniqueId = useId();
  const id = restProps.id ?? `${dPrefix}tooltip-${uniqueId}`;

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);

  const isFixed = isUndefined(dContainer);

  const maxZIndex = useMaxIndex(visible);
  const zIndex = (() => {
    if (isUndefined(dZIndex)) {
      if (isFixed) {
        return maxZIndex;
      } else {
        return `var(--${dPrefix}zindex-absolute)`;
      }
    } else {
      return dZIndex;
    }
  })();

  const containerEl = useElement(
    isUndefined(dContainer) || dContainer === false
      ? () => {
          if (dContainer === false) {
            const triggerEl = document.querySelector(`[aria-describedby="${id}"]`) as HTMLElement | null;
            return triggerEl?.parentElement ?? null;
          }
          return null;
        }
      : dContainer
  );

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [placement, setPlacement] = useState<DPopupPlacement>(dPlacement);
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    const triggerEl = document.querySelector(`[aria-describedby="${id}"]`) as HTMLElement | null;

    if (popupRef.current && triggerEl) {
      let currentPlacement = dPlacement;

      let space: [number, number, number, number] = [0, 0, 0, 0];
      if (!isFixed && containerEl) {
        const containerRect = containerEl.getBoundingClientRect();
        space = [
          containerRect.top,
          window.innerWidth - containerRect.left - containerRect.width,
          window.innerHeight - containerRect.top - containerRect.height,
          containerRect.left,
        ];
      }
      const position = getPopupPosition(popupRef.current, triggerEl, dPlacement, dDistance, isFixed, space);
      if (position) {
        currentPlacement = position.placement;
        setPlacement(position.placement);
        setPopupPositionStyle({
          position: isFixed ? undefined : 'absolute',
          top: position.top,
          left: position.left,
        });
      } else {
        const position = getPopupPosition(popupRef.current, triggerEl, placement, dDistance, isFixed);
        setPopupPositionStyle({
          position: isFixed ? undefined : 'absolute',
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

  useImperativeHandle(
    ref,
    () => ({
      updatePosition,
    }),
    [updatePosition]
  );

  return (
    <DTransition
      dIn={visible}
      dDuring={TTANSITION_DURING}
      onEnterRendered={updatePosition}
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

        return (
          <DPopup
            dPopup={({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPProps }) => (
              <div
                {...restProps}
                {...restPProps}
                ref={popupRef}
                id={id}
                className={getClassName(restProps.className, `${dPrefix}tooltip`, `${dPrefix}tooltip--` + placement)}
                style={{
                  ...restProps.style,
                  ...popupPositionStyle,
                  ...transitionStyle,
                  zIndex,
                }}
                role={restProps.role ?? 'tooltip'}
                onClick={(e) => {
                  restProps.onClick?.(e);
                  pOnClick?.(e);
                }}
                onMouseEnter={(e) => {
                  restProps.onMouseEnter?.(e);
                  pOnMouseEnter?.(e);
                }}
                onMouseLeave={(e) => {
                  restProps.onMouseLeave?.(e);
                  pOnMouseLeave?.(e);
                }}
              >
                {dArrow && <div className={`${dPrefix}tooltip__arrow`}></div>}
                {dTitle}
              </div>
            )}
            dVisible={visible}
            dContainer={isFixed ? undefined : containerEl}
            dTrigger={dTrigger}
            dDisabled={dDisabled}
            dEscClosable={dEscClosable}
            dMouseEnterDelay={dMouseEnterDelay}
            dMouseLeaveDelay={dMouseLeaveDelay}
            dUpdatePosition={updatePosition}
            onVisibleChange={changeVisible}
          >
            {({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPProps }) =>
              React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, {
                ...children.props,
                ...restPProps,
                'aria-describedby': children.props['aria-describedby'] ?? id,
                onClick: (e) => {
                  children.props.onClick?.(e);
                  pOnClick?.(e);
                },
                onMouseEnter: (e) => {
                  children.props.onMouseEnter?.(e);
                  pOnMouseEnter?.(e);
                },
                onMouseLeave: (e) => {
                  children.props.onMouseLeave?.(e);
                  pOnMouseLeave?.(e);
                },
              })
            }
          </DPopup>
        );
      }}
    </DTransition>
  );
}

export const DTooltip = React.forwardRef(Tooltip);
