import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DElementSelector } from '../../hooks/ui/useElement';
import type { DExtendsPopupProps } from '../_popup';
import type { DPlacement } from './utils';

import { isUndefined } from 'lodash';
import React, { useId, useImperativeHandle, useRef, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useEventCallback, useElement, useMaxIndex } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DPopup } from '../_popup';
import { DTransition } from '../_transition';
import { getPopupPlacementStyle } from './utils';

export interface DTooltipRef {
  updatePosition: () => void;
}

export interface DTooltipProps extends DExtendsPopupProps, React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement;
  dVisible?: [boolean, DUpdater<boolean>?];
  dTitle: React.ReactNode;
  dContainer?: DElementSelector | false;
  dPlacement?: DPlacement;
  dArrow?: boolean;
  dDistance?: number;
  dZIndex?: number | string;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const TTANSITION_DURING = { enter: 86, leave: 100 };
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTooltip' });
function Tooltip(props: DTooltipProps, ref: React.ForwardedRef<DTooltipRef>) {
  const {
    id,
    className,
    style,
    disabled,
    children,
    dVisible,
    dTitle,
    dContainer,
    dTrigger,
    dMouseEnterDelay,
    dMouseLeaveDelay,
    dEscClosable,
    dPlacement = 'top',
    dArrow = true,
    dDistance = 10,
    dZIndex,
    onVisibleChange,
    afterVisibleChange,
    onClick,
    onMouseEnter,
    onMouseLeave,
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

  const [visible, changeVisible] = useTwoWayBinding<boolean>(false, dVisible, onVisibleChange);

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
          if (isUndefined(dContainer)) {
            let el = document.getElementById(`${dPrefix}tooltip-root`);
            if (!el) {
              el = document.createElement('div');
              el.id = `${dPrefix}tooltip-root`;
              document.body.appendChild(el);
            }
            return el;
          } else {
            const triggerEl = document.querySelector(`[aria-describedby="${_id}"]`) as HTMLElement | null;
            return triggerEl?.parentElement ?? null;
          }
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

    if (popupRef.current && triggerEl && containerEl) {
      let currentPlacement = dPlacement;

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
            disabled={disabled}
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
                  pOnClick?.();
                }}
                onMouseEnter={(e) => {
                  onMouseEnter?.(e);
                  pOnMouseEnter?.();
                }}
                onMouseLeave={(e) => {
                  onMouseLeave?.(e);
                  pOnMouseLeave?.();
                }}
              >
                {dArrow && <div className={`${dPrefix}tooltip__arrow`}></div>}
                {dTitle}
              </div>
            )}
            dContainer={containerEl}
            dTrigger={dTrigger}
            dMouseEnterDelay={dMouseEnterDelay}
            dMouseLeaveDelay={dMouseLeaveDelay}
            dEscClosable={dEscClosable}
            onVisibleChange={changeVisible}
            onUpdate={updatePosition}
          >
            {({ pOnClick, pOnFocus, pOnBlur, pOnMouseEnter, pOnMouseLeave, ...restPCProps }) =>
              React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, {
                ...children.props,
                ...restPCProps,
                'aria-describedby': _id,
                onClick: (e) => {
                  children.props.onClick?.(e);
                  pOnClick?.();
                },
                onFocus: (e) => {
                  children.props.onFocus?.(e);
                  pOnFocus?.();
                },
                onBlur: (e) => {
                  children.props.onBlur?.(e);
                  pOnBlur?.();
                },
                onMouseEnter: (e) => {
                  children.props.onMouseEnter?.(e);
                  pOnMouseEnter?.();
                },
                onMouseLeave: (e) => {
                  children.props.onMouseLeave?.(e);
                  pOnMouseLeave?.();
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
