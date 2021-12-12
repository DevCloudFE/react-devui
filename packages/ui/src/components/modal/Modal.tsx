import type { DElementSelector } from '../../hooks/element-ref';
import type { Updater } from '../../hooks/immer';
import type { DDialogRef } from '../_dialog';

import { isUndefined, toNumber } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

import { usePrefixConfig, useComponentConfig, useRefCallback, useImmer, useRefSelector } from '../../hooks';
import { getClassName, MAX_INDEX_MANAGER, mergeStyle } from '../../utils';
import { DDialog } from '../_dialog';
import { DFooter } from '../_footer';
import { DHeader } from '../_header';

export interface DModalContextData {
  modalId?: number;
  closeModal?: () => void;
}
export const DModalContext = React.createContext<DModalContextData | null>(null);

export interface DModalProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: [boolean, Updater<boolean>?];
  dContainer?: DElementSelector | false;
  dTitle?: string | React.ReactNode;
  dWidth?: string | number;
  dZIndex?: number;
  dMask?: boolean;
  /**if click mask close the modal */
  dMaskClosable?: boolean;
  dOkText?: React.ReactNode;
  dCancelText?: React.ReactNode;
  dAfterClose?: () => void;
  dOnOk?: () => void;
  dOnCancel?: () => void;
  dChildModal?: React.ReactNode;
  __onVisibleChange?: (distance: { visible: boolean; top: number; right: number; bottom: number; left: number }) => void;
  __zIndex?: number;
}

export function DModal(props: DModalProps) {
  const {
    dVisible,
    dContainer,
    dTitle,
    dWidth = 520,
    dZIndex,
    dMaskClosable,
    style,
    dAfterClose,
    dMask = true,
    dOnOk,
    dOnCancel,
    // __onVisibleChange,
    __zIndex,
    children,
    dOkText,
    dCancelText,
    dChildModal,
  } = useComponentConfig(DModal.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [dialogRefContent, dialogRef] = useRefCallback<DDialogRef>();
  //#endregion

  const [zIndex, setZIndex] = useImmer(1000);

  const [visible, setVisible] = dVisible;
  const isFixed = isUndefined(dContainer);
  const handleContainer = useCallback(() => {
    if (isFixed) {
      let el = document.getElementById(`${dPrefix}modal-root`);
      if (!el) {
        el = document.createElement('div');
        el.id = `${dPrefix}modal-root`;
        document.body.appendChild(el);
      }
      return el;
    } else if (dContainer === false) {
      return dialogRefContent?.el?.parentElement ?? null;
    }
    return null;
  }, [dContainer, dPrefix, dialogRefContent?.el?.parentElement, isFixed]);
  const containerRef = useRefSelector(dContainer, handleContainer);

  //#region DidUpdate
  useEffect(() => {
    if (visible) {
      if (isUndefined(dZIndex)) {
        if (isUndefined(__zIndex)) {
          if (isFixed) {
            const [key, maxZIndex] = MAX_INDEX_MANAGER.getMaxIndex();
            setZIndex(maxZIndex);
            return () => {
              MAX_INDEX_MANAGER.deleteRecord(key);
            };
          } else {
            setZIndex(toNumber(getComputedStyle(document.body).getPropertyValue(`--${dPrefix}absolute-z-index`)));
          }
        } else {
          setZIndex(__zIndex);
        }
      } else {
        setZIndex(dZIndex);
      }
    }
  }, [__zIndex, dPrefix, dZIndex, isFixed, setZIndex, visible]);
  //#endregion

  const childModal = useMemo(() => {
    if (dChildModal) {
      const _childModal = React.Children.only(dChildModal) as React.ReactElement<DModalProps>;
      return React.cloneElement<DModalProps>(_childModal, {
        ..._childModal.props,
        __zIndex: zIndex + 1,
      });
    }
    return null;
  }, [dChildModal, zIndex]);

  const contentProps = useMemo<React.HTMLAttributes<HTMLDivElement>>(
    () => ({
      className: getClassName(`${dPrefix}modal__content`),
      style: {
        width: dWidth,
        margin: '0 auto',
        position: 'relative',
        top: '100px',
      },
    }),
    [dPrefix, dWidth]
  );

  const closeModal = useCallback(() => {
    setVisible?.(false);
    dAfterClose?.();
  }, [dAfterClose, setVisible]);

  const modalNode = (
    <>
      <DDialog
        ref={dialogRef}
        dMask={dMask}
        dVisible={visible}
        onClose={closeModal}
        style={mergeStyle(style, { zIndex: dZIndex })}
        dContentProps={contentProps}
        dMaskClosable={dMaskClosable}
      >
        <div className={`${dPrefix}modal__content`}>
          <DHeader onClose={closeModal}>{dTitle}</DHeader>
          <div className={`${dPrefix}modal__body`}>{children}</div>
          <DFooter
            onOkClick={() => {
              dOnOk?.();
              closeModal();
            }}
            onCancelClick={() => {
              dOnCancel?.();
              closeModal();
            }}
            okText={dOkText}
            cancelText={dCancelText}
          />
        </div>
      </DDialog>
      {childModal}
    </>
  );

  return dContainer === false ? modalNode : containerRef.current && ReactDOM.createPortal(modalNode, containerRef.current);
}
