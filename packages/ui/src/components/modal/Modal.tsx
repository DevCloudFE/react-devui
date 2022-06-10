import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DModalFooterProps, DModalFooterPropsWithPrivate } from './ModalFooter';
import type { DModalHeaderProps, DModalHeaderPropsWithPrivate } from './ModalHeader';

import { isNumber, isString, isUndefined } from 'lodash';
import React, { useEffect, useId, useRef } from 'react';
import ReactDOM from 'react-dom';

import { usePrefixConfig, useComponentConfig, useElement, useLockScroll, useMaxIndex, useEventCallback, useAsync } from '../../hooks';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, WarningOutlined } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { DMask } from '../_mask';
import { DTransition } from '../_transition';
import { DModalHeader } from './ModalHeader';

export interface DModalProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: [boolean, DUpdater<boolean>?];
  dWidth?: number | string;
  dTop?: number | string;
  dZIndex?: number | string;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dEscClosable?: boolean;
  dType?: {
    type: 'success' | 'warning' | 'error' | 'info';
    title?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
  };
  dHeader?: React.ReactElement<DModalHeaderProps> | string;
  dFooter?: React.ReactElement<DModalFooterProps>;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const TTANSITION_DURING = 200;
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DModal' });
export function DModal(props: DModalProps): JSX.Element | null {
  const {
    children,
    dVisible,
    dWidth = 520,
    dTop = 100,
    dZIndex,
    dMask = true,
    dMaskClosable = true,
    dEscClosable = true,
    dType,
    dHeader,
    dFooter,
    onClose,
    afterVisibleChange,

    className,
    style,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
    x: number;
    y: number;
    transformOrigin?: string;
  }>({ x: 0, y: 0 });

  const asyncCapture = useAsync();

  const uniqueId = useId();
  const headerId = `${dPrefix}modal-header-${uniqueId}`;
  const contentId = `${dPrefix}modal-content-${uniqueId}`;

  const topStyle = dTop + (isNumber(dTop) ? 'px' : '');

  const [visible, setVisible] = dVisible;

  const maxZIndex = useMaxIndex(visible);
  const zIndex = (() => {
    if (!isUndefined(dZIndex)) {
      return dZIndex;
    }
    return maxZIndex;
  })();

  const containerEl = useElement(() => {
    let el = document.getElementById(`${dPrefix}modal-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}modal-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  const closeModal = useEventCallback(() => {
    setVisible?.(false);
    onClose?.();
  });

  useLockScroll(visible);

  const prevActiveEl = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (visible) {
      prevActiveEl.current = document.activeElement as HTMLElement | null;

      if (modalContentRef.current) {
        modalContentRef.current.focus({ preventScroll: true });
      }
    } else if (prevActiveEl.current) {
      prevActiveEl.current.focus({ preventScroll: true });
    }
  }, [asyncCapture, visible]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    asyncGroup.fromEvent<MouseEvent>(window, 'click', { capture: true }).subscribe({
      next: (e) => {
        dataRef.current.x = e.clientX;
        dataRef.current.y = e.clientY;
        dataRef.current.clearTid?.();
        dataRef.current.clearTid = asyncGroup.setTimeout(() => {
          dataRef.current.clearTid = undefined;
        }, 20);
      },
    });

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture]);

  const headerNode = (() => {
    if (dHeader) {
      const node = isString(dHeader) ? <DModalHeader>{dHeader}</DModalHeader> : dHeader;
      return React.cloneElement<DModalHeaderPropsWithPrivate>(node, {
        ...node.props,
        __id: headerId,
        __onClose: closeModal,
      });
    }
  })();

  return (
    containerEl &&
    ReactDOM.createPortal(
      <DTransition
        dIn={visible}
        dDuring={TTANSITION_DURING}
        onEnterRendered={() => {
          if (isUndefined(dataRef.current.clearTid)) {
            dataRef.current.transformOrigin = undefined;
          } else if (modalContentRef.current) {
            const left = `${(window.innerWidth - modalContentRef.current.clientWidth) / 2}px`;
            const top = dTop === 'center' ? `${(window.innerHeight - modalContentRef.current.clientHeight) / 2}px` : topStyle;
            dataRef.current.transformOrigin = `calc(${dataRef.current.x}px - ${left}) calc(${dataRef.current.y}px - ${top})`;
          }
        }}
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
                transition: `transform ${TTANSITION_DURING}ms ease-out, opacity ${TTANSITION_DURING}ms ease-out`,
                transformOrigin: dataRef.current.transformOrigin,
              };
              break;

            case 'leaving':
              transitionStyle = {
                transform: 'scale(0.3)',
                opacity: 0,
                transition: `transform ${TTANSITION_DURING}ms ease-in, opacity ${TTANSITION_DURING}ms ease-in`,
                transformOrigin: dataRef.current.transformOrigin,
              };
              break;

            default:
              break;
          }

          return (
            <div
              {...restProps}
              ref={modalRef}
              className={getClassName(className, `${dPrefix}modal`, {
                [`${dPrefix}modal--center`]: dTop === 'center',
                [`${dPrefix}modal--type`]: dType,
              })}
              style={{
                ...style,
                display: state === 'leaved' ? 'none' : undefined,
                zIndex,
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={headerNode ? headerId : undefined}
              aria-describedby={contentId}
            >
              {dMask && (
                <DMask
                  dVisible={visible}
                  onClose={() => {
                    if (dMaskClosable) {
                      closeModal();
                    }
                  }}
                />
              )}
              <div
                ref={modalContentRef}
                id={contentId}
                className={`${dPrefix}modal__content`}
                style={{
                  ...transitionStyle,
                  width: dWidth,
                  top: dTop === 'center' ? undefined : dTop,
                  maxHeight: dTop === 'center' ? undefined : `calc(100vh - ${topStyle} - 20px)`,
                }}
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (dEscClosable && e.code === 'Escape') {
                    closeModal();
                  }
                }}
              >
                {headerNode}
                <div className={`${dPrefix}modal__body`}>
                  {dType ? (
                    <>
                      <div className={`${dPrefix}modal__icon`}>
                        {!isUndefined(dType.icon) ? (
                          dType.icon
                        ) : dType.type === 'success' ? (
                          <CheckCircleOutlined dTheme="success" />
                        ) : dType.type === 'warning' ? (
                          <WarningOutlined dTheme="warning" />
                        ) : dType.type === 'error' ? (
                          <CloseCircleOutlined dTheme="danger" />
                        ) : (
                          <ExclamationCircleOutlined dTheme="primary" />
                        )}
                      </div>
                      <div className={`${dPrefix}modal__type-wrapper`}>
                        {!isUndefined(dType.title) && <div className={`${dPrefix}modal__title`}>{dType.title}</div>}
                        {!isUndefined(dType.description) && <div className={`${dPrefix}modal__description`}>{dType.description}</div>}
                      </div>
                    </>
                  ) : (
                    children
                  )}
                </div>
                {dFooter &&
                  React.cloneElement<DModalFooterPropsWithPrivate>(dFooter, {
                    ...dFooter.props,
                    __onClose: closeModal,
                  })}
              </div>
            </div>
          );
        }}
      </DTransition>,
      containerEl
    )
  );
}
