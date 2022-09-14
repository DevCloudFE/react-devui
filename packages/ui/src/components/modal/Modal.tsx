import type { DModalFooterPropsWithPrivate } from './ModalFooter';
import type { DModalHeaderPropsWithPrivate } from './ModalHeader';

import { isNumber, isString, isUndefined } from 'lodash';
import React, { useEffect, useId, useRef } from 'react';
import ReactDOM from 'react-dom';

import { useAsync, useElement, useEvent, useLockScroll } from '@react-devui/hooks';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, WarningOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useMaxIndex, useDValue } from '../../hooks';
import { registerComponentMate, handleModalKeyDown, TTANSITION_DURING_BASE } from '../../utils';
import { DMask } from '../_mask';
import { DTransition } from '../_transition';
import { DModalFooter } from './ModalFooter';
import { DModalHeader } from './ModalHeader';

export interface DModalProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
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
  dHeader?: React.ReactElement | string;
  dFooter?: React.ReactElement;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DModal' as const });
export const DModal: {
  (props: DModalProps): JSX.Element | null;
  Header: typeof DModalHeader;
  Footer: typeof DModalFooter;
} = (props) => {
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
    onVisibleChange,
    afterVisibleChange,

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
  }>({
    x: 0,
    y: 0,
  });

  const async = useAsync();

  const uniqueId = useId();
  const titleId = `${dPrefix}modal-title-${uniqueId}`;
  const bodyId = `${dPrefix}modal-content-${uniqueId}`;

  const topStyle = dTop + (isNumber(dTop) ? 'px' : '');

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);

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

  useLockScroll(visible);

  const prevActiveEl = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (visible) {
      prevActiveEl.current = document.activeElement as HTMLElement | null;

      if (modalRef.current) {
        modalRef.current.focus({ preventScroll: true });
      }
    } else if (prevActiveEl.current) {
      prevActiveEl.current.focus({ preventScroll: true });
    }
  }, [visible]);

  useEvent<MouseEvent>(
    window,
    'click',
    (e) => {
      dataRef.current.x = e.clientX;
      dataRef.current.y = e.clientY;
      dataRef.current.clearTid?.();
      dataRef.current.clearTid = async.setTimeout(() => {
        dataRef.current.clearTid = undefined;
      }, 20);
    },
    { capture: true }
  );

  const headerNode = (() => {
    if (dHeader) {
      const node = isString(dHeader) ? <DModalHeader>{dHeader}</DModalHeader> : dHeader;
      return React.cloneElement<DModalHeaderPropsWithPrivate>(node, {
        ...node.props,
        __id: titleId,
        __onClose: () => {
          changeVisible(false);
        },
      });
    }
  })();

  return (
    containerEl &&
    ReactDOM.createPortal(
      <DTransition
        dIn={visible}
        dDuring={TTANSITION_DURING_BASE}
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
                transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
                transformOrigin: dataRef.current.transformOrigin,
              };
              break;

            case 'leaving':
              transitionStyle = {
                transform: 'scale(0.3)',
                opacity: 0,
                transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
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
              className={getClassName(restProps.className, `${dPrefix}modal`, {
                [`${dPrefix}modal--center`]: dTop === 'center',
                [`${dPrefix}modal--type`]: dType,
              })}
              style={{
                ...restProps.style,
                display: state === 'leaved' ? 'none' : undefined,
                zIndex,
              }}
              tabIndex={-1}
              role={restProps.role ?? 'dialog'}
              aria-modal={restProps['aria-modal'] ?? 'true'}
              aria-labelledby={restProps['aria-labelledby'] ?? (headerNode ? titleId : undefined)}
              aria-describedby={restProps['aria-describedby'] ?? bodyId}
              onKeyDown={(e) => {
                restProps.onKeyDown?.(e);

                if (dEscClosable && e.code === 'Escape') {
                  changeVisible(false);
                }

                handleModalKeyDown(e);
              }}
            >
              {dMask && (
                <DMask
                  dVisible={visible}
                  onClose={() => {
                    if (dMaskClosable) {
                      changeVisible(false);
                    }
                  }}
                />
              )}
              <div
                ref={modalContentRef}
                className={`${dPrefix}modal__content`}
                style={{
                  ...transitionStyle,
                  width: dWidth,
                  top: dTop === 'center' ? undefined : dTop,
                  maxHeight: dTop === 'center' ? undefined : `calc(100% - ${topStyle} - 20px)`,
                }}
              >
                {headerNode}
                <div id={bodyId} className={`${dPrefix}modal__body`}>
                  {dType ? (
                    <>
                      <div className={`${dPrefix}modal__icon`}>
                        {checkNodeExist(dType.icon) ? (
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
                        {checkNodeExist(dType.title) && <div className={`${dPrefix}modal__title`}>{dType.title}</div>}
                        {checkNodeExist(dType.description) && <div className={`${dPrefix}modal__description`}>{dType.description}</div>}
                      </div>
                    </>
                  ) : (
                    children
                  )}
                </div>
                {dFooter &&
                  React.cloneElement<DModalFooterPropsWithPrivate>(dFooter, {
                    ...dFooter.props,
                    __onClose: () => {
                      changeVisible(false);
                    },
                  })}
              </div>
            </div>
          );
        }}
      </DTransition>,
      containerEl
    )
  );
};

DModal.Header = DModalHeader;
DModal.Footer = DModalFooter;
