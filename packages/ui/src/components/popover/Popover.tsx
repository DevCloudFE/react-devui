import type { DPopoverFooterPropsWithPrivate } from './PopoverFooter';
import type { DPopoverHeaderPropsWithPrivate } from './PopoverHeader';
import type { DElementSelector } from '@react-devui/hooks/useElement';
import type { DPopupPlacement } from '@react-devui/utils/position';

import { isString, isUndefined } from 'lodash';
import React, { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';

import { useElement, useEventCallback, useLockScroll } from '@react-devui/hooks';
import { getClassName, getPopupPosition } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useMaxIndex, useDValue } from '../../hooks';
import { registerComponentMate, handleModalKeyDown } from '../../utils';
import { DPopup } from '../_popup';
import { DTransition } from '../_transition';
import { DPopoverFooter } from './PopoverFooter';
import { DPopoverHeader } from './PopoverHeader';

export interface DPopoverRef {
  updatePosition: () => void;
}

export interface DPopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dVisible?: boolean;
  dTrigger?: 'hover' | 'click';
  dContainer?: DElementSelector | false;
  dPlacement?: DPopupPlacement;
  dEscClosable?: boolean;
  dArrow?: boolean;
  dModal?: boolean;
  dDisabled?: boolean;
  dDistance?: number;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dZIndex?: number | string;
  dHeader?: React.ReactElement | string;
  dContent: React.ReactNode;
  dFooter?: React.ReactElement;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const TTANSITION_DURING = { enter: 86, leave: 100 };
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DPopover' });
function Popover(props: DPopoverProps, ref: React.ForwardedRef<DPopoverRef>): JSX.Element | null {
  const {
    children,
    dVisible,
    dTrigger = 'hover',
    dContainer,
    dPlacement = 'top',
    dEscClosable = true,
    dArrow = true,
    dModal = false,
    dDisabled = false,
    dDistance = 10,
    dMouseEnterDelay = 150,
    dMouseLeaveDelay = 200,
    dZIndex,
    dHeader,
    dContent,
    dFooter,
    onVisibleChange,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const popoverRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  //#endregion

  const uniqueId = useId();
  const titleId = `${dPrefix}popover-title-${uniqueId}`;
  const bodyId = `${dPrefix}popover-content-${uniqueId}`;

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
            const triggerEl = document.querySelector(`[data-popover-triggerid="${uniqueId}"]`) as HTMLElement | null;
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
    const triggerEl = document.querySelector(`[data-popover-triggerid="${uniqueId}"]`) as HTMLElement | null;

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

  useLockScroll(dModal && visible);

  const prevActiveEl = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (dModal) {
      if (visible) {
        prevActiveEl.current = document.activeElement as HTMLElement | null;

        if (popoverRef.current) {
          popoverRef.current.focus({ preventScroll: true });
        }
      } else if (prevActiveEl.current) {
        prevActiveEl.current.focus({ preventScroll: true });
      }
    }
  }, [dModal, visible]);

  const headerNode = (() => {
    if (dHeader) {
      const node = isString(dHeader) ? <DPopoverHeader>{dHeader}</DPopoverHeader> : dHeader;
      return React.cloneElement<DPopoverHeaderPropsWithPrivate>(node, {
        ...node.props,
        __id: titleId,
        __onClose: () => {
          changeVisible(false);
        },
      });
    }
  })();

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

          default:
            break;
        }

        return (
          <DPopup
            dPopup={({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPProps }) => (
              <div
                {...restProps}
                ref={popoverRef}
                className={getClassName(restProps.className, `${dPrefix}popover`, `${dPrefix}popover--` + placement)}
                style={{
                  ...restProps.style,
                  display: state === 'leaved' ? 'none' : undefined,
                  zIndex,
                }}
                tabIndex={-1}
                role={restProps.role ?? (dModal ? 'alertdialog' : 'alert')}
                aria-modal={restProps['aria-modal'] ?? dModal}
                aria-labelledby={restProps['aria-labelledby'] ?? (headerNode ? titleId : undefined)}
                aria-describedby={restProps['aria-describedby'] ?? bodyId}
                onKeyDown={(e) => {
                  restProps.onKeyDown?.(e);

                  if (dEscClosable && e.code === 'Escape') {
                    changeVisible(false);
                  }

                  if (dModal) {
                    handleModalKeyDown(e);
                  }
                }}
              >
                {dModal && (
                  <div
                    className={`${dPrefix}popover__mask`}
                    onClick={() => {
                      changeVisible(false);
                    }}
                  ></div>
                )}
                <div
                  {...restPProps}
                  ref={popupRef}
                  className={`${dPrefix}popover__content`}
                  style={{
                    ...popupPositionStyle,
                    ...transitionStyle,
                  }}
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
                  {dArrow && <div className={`${dPrefix}popover__arrow`}></div>}
                  {headerNode}
                  <div id={bodyId} className={`${dPrefix}popover__body`}>
                    {dContent}
                  </div>
                  {dFooter &&
                    React.cloneElement<DPopoverFooterPropsWithPrivate>(dFooter, {
                      ...dFooter.props,
                      __onClose: () => {
                        changeVisible(false);
                      },
                    })}
                </div>
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
                'data-popover-triggerid': uniqueId,
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

export const DPopover: {
  (props: DPopoverProps & React.RefAttributes<DPopoverRef>): ReturnType<typeof Popover>;
  Header: typeof DPopoverHeader;
  Footer: typeof DPopoverFooter;
} = React.forwardRef(Popover) as any;

DPopover.Header = DPopoverHeader;
DPopover.Footer = DPopoverFooter;
