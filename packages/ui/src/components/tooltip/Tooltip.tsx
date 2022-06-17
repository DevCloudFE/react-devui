import type { DElementSelector } from '../../hooks/ui/useElement';
import type { DExtendsPopupProps } from '../_popup';
import type { DPlacement } from './utils';

import { isUndefined } from 'lodash';
import React, { useId, useImperativeHandle, useRef, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useEventCallback, useElement, useMaxIndex, useDValue } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DPopup } from '../_popup';
import { DTransition } from '../_transition';
import { getPopupPlacementStyle } from './utils';

export interface DTooltipRef {
  updatePosition: () => void;
}

export interface DTooltipProps extends DExtendsPopupProps, React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement;
  dVisible?: boolean;
  dTitle: React.ReactNode;
  dContainer?: DElementSelector | false;
  dPlacement?: DPlacement;
  dArrow?: boolean;
  dDistance?: number;
  dZIndex?: number | string;
  afterVisibleChange?: (visible: boolean) => void;
}

const TTANSITION_DURING = { enter: 86, leave: 100 };
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTooltip' });
function Tooltip(props: DTooltipProps, ref: React.ForwardedRef<DTooltipRef>) {
  const {
    children,
    dVisible,
    dTitle,
    dContainer,
    dPlacement = 'top',
    dArrow = true,
    dDistance = 10,
    dZIndex,
    afterVisibleChange,

    dTrigger,
    dMouseEnterDelay,
    dMouseLeaveDelay,
    dEscClosable,
    dDisabled,
    onVisibleChange,

    id,
    className,
    style,
    onMouseEnter,
    onMouseLeave,
    onClick,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const popupRef = useRef<HTMLDivElement>(null);
  //#endregion

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}tooltip-${uniqueId}`;

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
            const triggerEl = document.querySelector(`[aria-describedby="${_id}"]`) as HTMLElement | null;
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
  const [placement, setPlacement] = useState<DPlacement>(dPlacement);
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    const triggerEl = document.querySelector(`[aria-describedby="${_id}"]`) as HTMLElement | null;

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
      const position = getPopupPlacementStyle(popupRef.current, triggerEl, dPlacement, dDistance, isFixed, space);
      if (position) {
        currentPlacement = position.placement;
        setPlacement(position.placement);
        setPopupPositionStyle({
          position: isFixed ? undefined : 'absolute',
          top: position.top,
          left: position.left,
        });
      } else {
        const position = getPopupPlacementStyle(popupRef.current, triggerEl, placement, dDistance, isFixed);
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
              transition: `transform ${TTANSITION_DURING.enter}ms ease-out, opacity ${TTANSITION_DURING.enter}ms ease-out`,
              transformOrigin,
            };
            break;

          case 'leaving':
            transitionStyle = {
              transform: 'scale(0.3)',
              opacity: 0,
              transition: `transform ${TTANSITION_DURING.leave}ms ease-in, opacity ${TTANSITION_DURING.leave}ms ease-in`,
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
            dDisabled={dDisabled}
            dVisible={visible}
            dPopup={({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPCProps }) => (
              <div
                {...restProps}
                {...restPCProps}
                ref={popupRef}
                id={_id}
                className={getClassName(className, `${dPrefix}tooltip`, `${dPrefix}tooltip--` + placement)}
                style={{
                  ...style,
                  ...popupPositionStyle,
                  ...transitionStyle,
                  zIndex,
                }}
                role="tooltip"
                onClick={(e) => {
                  onClick?.(e);
                  pOnClick?.(e);
                }}
                onMouseEnter={(e) => {
                  onMouseEnter?.(e);
                  pOnMouseEnter?.(e);
                }}
                onMouseLeave={(e) => {
                  onMouseLeave?.(e);
                  pOnMouseLeave?.(e);
                }}
              >
                {dArrow && <div className={`${dPrefix}tooltip__arrow`}></div>}
                {dTitle}
              </div>
            )}
            dContainer={isFixed ? undefined : containerEl}
            dTrigger={dTrigger}
            dMouseEnterDelay={dMouseEnterDelay}
            dMouseLeaveDelay={dMouseLeaveDelay}
            dEscClosable={dEscClosable}
            onVisibleChange={changeVisible}
            onUpdatePosition={updatePosition}
          >
            {({ pOnClick, pOnFocus, pOnBlur, pOnMouseEnter, pOnMouseLeave, ...restPCProps }) =>
              React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, {
                ...children.props,
                ...restPCProps,
                'aria-describedby': _id,
                onClick: (e) => {
                  children.props.onClick?.(e);
                  pOnClick?.(e);
                },
                onFocus: (e) => {
                  children.props.onFocus?.(e);
                  pOnFocus?.(e);
                },
                onBlur: (e) => {
                  children.props.onBlur?.(e);
                  pOnBlur?.(e);
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
