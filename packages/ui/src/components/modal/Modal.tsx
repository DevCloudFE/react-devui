import type { Updater } from '../../hooks/immer';

import React, { useCallback, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { getClassName, mergeStyle } from '../../utils';
import { DDialog } from '../_dialog';
import { DFooter } from '../_footer';
import { DHeader } from '../_header';

export interface DModalContextData {
  modalId?: number;
  closeModal?: () => void;
}

export interface DModalProps {
  visible: [boolean, Updater<boolean>?];
  title?: string | React.ReactNode;
  width?: string | number;
  zIndex?: number;
  mask?: boolean;
  /**if click mask close the modal */
  maskClosable?: boolean;
  style?: React.CSSProperties;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  afterClose?: () => void;
  onOk?: () => void;
  onCancel?: () => void;
}

const DModal: React.FC<DModalProps> = (props) => {
  const {
    visible,
    title,
    width = 520,
    zIndex,
    maskClosable,
    style,
    afterClose,
    mask = true,
    onOk,
    onCancel,
    children,
    okText,
    cancelText,
  } = useComponentConfig(DModal.name, props);
  const dPrefix = usePrefixConfig();

  const contentProps = useMemo<React.HTMLAttributes<HTMLDivElement>>(
    () => ({
      className: getClassName(`${dPrefix}modal__content`),
      style: {
        width,
        margin: '0 auto',
        position: 'relative',
        top: '100px',
      },
    }),
    [dPrefix, width]
  );

  const [dVisible, setVisible] = visible;

  const closeModal = useCallback(() => {
    setVisible?.(false);
    afterClose?.();
  }, [afterClose, setVisible]);

  return (
    <div className={`${dPrefix}modal__root`}>
      <DDialog
        dMask={mask}
        dVisible={dVisible}
        onClose={closeModal}
        style={mergeStyle(style, { zIndex })}
        dContentProps={contentProps}
        dMaskClosable={maskClosable}
      >
        <div className={`${dPrefix}modal__content`}>
          <DHeader onClose={closeModal}>{title}</DHeader>
          <div className={`${dPrefix}modal__body`}>{children}</div>
          <DFooter
            onOkClick={() => {
              onOk?.();
              closeModal();
            }}
            onCancelClick={() => {
              onCancel?.();
              closeModal();
            }}
            okText={okText}
            cancelText={cancelText}
          />
        </div>
      </DDialog>
    </div>
  );
};

export { DModal };
