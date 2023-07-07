import type { DModalFooterPrivateProps } from './ModalFooter';
import type { DModalHeaderPrivateProps } from './ModalHeader';

import { isNumber, isString, isUndefined } from 'lodash';
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';

import { useId, useRefExtra } from '@react-devui/hooks';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, WarningOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { useMaxIndex, useDValue, useLockScroll } from '../../hooks';
import { registerComponentMate, handleModalKeyDown, TTANSITION_DURING_BASE, checkNoExpandedEl } from '../../utils';
import { DMask } from '../_mask';
import { DTransition } from '../_transition';
import { ROOT_DATA, useComponentConfig, usePrefixConfig } from '../root';
import { DModalFooter } from './ModalFooter';
import { DModalHeader } from './ModalHeader';

export interface DModalProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dInitialVisible?: boolean;
  dWidth?: number | string;
  dTop?: number | string;
  dZIndex?: number | string;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dEscClosable?: boolean;
  dSkipFirstTransition?: boolean;
  dDestroyAfterClose?: boolean;
  dType?: {
    type: 'success' | 'warning' | 'error' | 'info';
    title?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
  };
  dHeader?: React.ReactElement | string;
  dFooter?: React.ReactElement;
  onClose?: () => void;
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
    dInitialVisible = false,
    dWidth = 520,
    dTop = 100,
    dZIndex,
    dMask = true,
    dMaskClosable = true,
    dEscClosable = true,
    dSkipFirstTransition = true,
    dDestroyAfterClose = true,
    dType,
    dHeader,
    dFooter,
    onClose,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRefExtra(() => {
    let el = document.getElementById(`${dPrefix}modal-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}modal-root`;
      document.body.appendChild(el);
    }
    return el;
  }, true);
  //#endregion

  const dataRef = useRef<{
    transformOrigin?: string;
    prevActiveEl: HTMLElement | null;
  }>({
    prevActiveEl: null,
  });

  const uniqueId = useId();
  const titleId = `${dPrefix}modal-title-${uniqueId}`;
  const bodyId = `${dPrefix}modal-content-${uniqueId}`;

  const topStyle = dTop + (isNumber(dTop) ? 'px' : '');

  const [visible, changeVisible] = useDValue<boolean>(dInitialVisible, dVisible, onClose);

  const maxZIndex = useMaxIndex(visible);
  const zIndex = (() => {
    if (!isUndefined(dZIndex)) {
      return dZIndex;
    }
    return maxZIndex;
  })();

  useLockScroll(visible);

  const headerNode = (() => {
    if (dHeader) {
      const node = isString(dHeader) ? <DModalHeader>{dHeader}</DModalHeader> : dHeader;
      return React.cloneElement<DModalHeaderPrivateProps>(node, {
        __id: titleId,
        __onClose: () => {
          changeVisible(false);
        },
      });
    }
  })();

  return (
    containerRef.current &&
    ReactDOM.createPortal(
      <DTransition
        dIn={visible}
        dDuring={TTANSITION_DURING_BASE}
        dSkipFirstTransition={dSkipFirstTransition}
        dDestroyWhenLeaved={dDestroyAfterClose}
        onEnter={() => {
          if (isUndefined(ROOT_DATA.clickEvent) || performance.now() - ROOT_DATA.clickEvent.time > 100) {
            dataRef.current.transformOrigin = undefined;
          } else if (modalContentRef.current) {
            const left = `${(ROOT_DATA.pageSize.width - modalContentRef.current.offsetWidth) / 2}px`;
            const top = dTop === 'center' ? `${(ROOT_DATA.pageSize.height - modalContentRef.current.offsetHeight) / 2}px` : topStyle;
            dataRef.current.transformOrigin = `calc(${ROOT_DATA.clickEvent.e.clientX}px - ${left}) calc(${ROOT_DATA.clickEvent.e.clientY}px - ${top})`;
          }
        }}
        afterEnter={() => {
          afterVisibleChange?.(true);

          dataRef.current.prevActiveEl = document.activeElement as HTMLElement | null;
          if (modalRef.current) {
            modalRef.current.focus({ preventScroll: true });
          }
        }}
        afterLeave={() => {
          afterVisibleChange?.(false);

          if (dataRef.current.prevActiveEl) {
            dataRef.current.prevActiveEl.focus({ preventScroll: true });
          }
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
              role="dialog"
              aria-modal
              aria-labelledby={headerNode ? titleId : undefined}
              aria-describedby={bodyId}
              onKeyDown={(e) => {
                restProps.onKeyDown?.(e);

                if (dEscClosable && checkNoExpandedEl(e.currentTarget) && e.code === 'Escape') {
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
                  width: dWidth,
                  top: dTop === 'center' ? undefined : dTop,
                  maxHeight: dTop === 'center' ? undefined : `calc(100% - ${topStyle} - 20px)`,
                  ...transitionStyle,
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
                  React.cloneElement<DModalFooterPrivateProps>(dFooter, {
                    __onClose: () => {
                      changeVisible(false);
                    },
                  })}
              </div>
            </div>
          );
        }}
      </DTransition>,
      containerRef.current
    )
  );
};

DModal.Header = DModalHeader;
DModal.Footer = DModalFooter;
