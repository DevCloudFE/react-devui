import type { DPopoverFooterPrivateProps } from './PopoverFooter';
import type { DPopoverHeaderPrivateProps } from './PopoverHeader';
import type { DRefExtra } from '@react-devui/hooks/useRefExtra';
import type { DPopupPlacement } from '@react-devui/utils/position';

import { isString, isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { useEventCallback, useId, useLockScroll, useRefExtra } from '@react-devui/hooks';
import { getClassName, getPopupPosition } from '@react-devui/utils';

import { useMaxIndex, useDValue } from '../../hooks';
import { registerComponentMate, handleModalKeyDown, cloneHTMLElement } from '../../utils';
import { DPopup } from '../_popup';
import { DTransition } from '../_transition';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DPopoverFooter } from './PopoverFooter';
import { DPopoverHeader } from './PopoverHeader';

export interface DPopoverRef {
  updatePosition: () => void;
}

export interface DPopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dVisible?: boolean;
  dTrigger?: 'hover' | 'click';
  dContainer?: DRefExtra | false;
  dPlacement?: DPopupPlacement;
  dEscClosable?: boolean;
  dDestroyAfterClose?: boolean;
  dArrow?: boolean;
  dModal?: boolean;
  dDistance?: number;
  dInWindow?: number | false;
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
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DPopover' as const });
function Popover(props: DPopoverProps, ref: React.ForwardedRef<DPopoverRef>): JSX.Element | null {
  const {
    children,
    dVisible,
    dTrigger = 'hover',
    dContainer,
    dPlacement = 'top',
    dEscClosable = true,
    dDestroyAfterClose = false,
    dArrow = true,
    dModal = false,
    dDistance = 10,
    dInWindow = false,
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
  const triggerRef = useRefExtra(() => document.getElementById(triggerId));
  const popoverRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const containerRef = useRefExtra(
    isUndefined(dContainer)
      ? () => {
          let el = document.getElementById(`${dPrefix}popover-root`);
          if (!el) {
            el = document.createElement('div');
            el.id = `${dPrefix}popover-root`;
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

  const dataRef = useRef<{
    prevActiveEl: HTMLElement | null;
  }>({
    prevActiveEl: null,
  });

  const uniqueId = useId();
  const triggerId = children.props.id ?? `${dPrefix}popover-trigger-${uniqueId}`;
  const titleId = `${dPrefix}popover-title-${uniqueId}`;
  const bodyId = `${dPrefix}popover-content-${uniqueId}`;

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

  useLockScroll(dModal && visible);

  useEffect(() => {
    if (dModal) {
      if (visible) {
        dataRef.current.prevActiveEl = document.activeElement as HTMLElement | null;

        if (popoverRef.current) {
          popoverRef.current.focus({ preventScroll: true });
        }
      } else if (dataRef.current.prevActiveEl) {
        dataRef.current.prevActiveEl.focus({ preventScroll: true });
      }
    }
  }, [dModal, visible]);

  const headerNode = (() => {
    if (dHeader) {
      const node = isString(dHeader) ? <DPopoverHeader>{dHeader}</DPopoverHeader> : dHeader;
      return React.cloneElement<DPopoverHeaderPrivateProps>(node, {
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
    <DPopup
      dVisible={visible}
      dTrigger={dTrigger}
      dEscClosable={dEscClosable}
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
            cloneHTMLElement(children, {
              id: triggerId,
            })
          )}
          {containerRef.current &&
            ReactDOM.createPortal(
              <DTransition
                dIn={visible}
                dDuring={TTANSITION_DURING}
                dDestroyWhenLeaved={dDestroyAfterClose}
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

                    default:
                      break;
                  }

                  return (
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
                      role={restProps.role ?? 'dialog'}
                      aria-modal={dModal}
                      aria-labelledby={headerNode ? titleId : undefined}
                      aria-describedby={bodyId}
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
                      {renderPopup(
                        <div
                          ref={popupRef}
                          className={`${dPrefix}popover__content`}
                          style={{
                            ...popupPositionStyle,
                            ...transitionStyle,
                          }}
                        >
                          {dArrow && <div className={`${dPrefix}popover__arrow`}></div>}
                          {headerNode}
                          <div id={bodyId} className={`${dPrefix}popover__body`}>
                            {dContent}
                          </div>
                          {dFooter &&
                            React.cloneElement<DPopoverFooterPrivateProps>(dFooter, {
                              __onClose: () => {
                                changeVisible(false);
                              },
                            })}
                        </div>
                      )}
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

export const DPopover: {
  (props: DPopoverProps & React.RefAttributes<DPopoverRef>): ReturnType<typeof Popover>;
  Header: typeof DPopoverHeader;
  Footer: typeof DPopoverFooter;
} = React.forwardRef(Popover) as any;

DPopover.Header = DPopoverHeader;
DPopover.Footer = DPopoverFooter;
