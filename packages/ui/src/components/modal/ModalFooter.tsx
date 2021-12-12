import type { DFooterProps } from '../_footer';

import { isBoolean } from 'lodash';
import { useCallback, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useImmer } from '../../hooks';
import { getClassName } from '../../utils';
import { DFooter } from '../_footer';
import { DModalContext } from './Modal';

export interface DModalFooterProps extends DFooterProps {
  onOkClick?: () => void | boolean | Promise<void | boolean>;
  onCancelClick?: () => void | boolean | Promise<void | boolean>;
  okText?: string;
  cancelText?: string;
}

export function DModalFooter(props: DModalFooterProps) {
  const { className, dOkButtonProps, dCancelButtonProps, onOkClick, onCancelClick, ...restProps } = useComponentConfig(
    DModalFooter.name,
    props
  );

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ closeModal }] = useCustomContext(DModalContext);
  //#endregion

  const [okLoading, setOkLoading] = useImmer(false);
  const [cancelLoading, setCancelLoading] = useImmer(false);

  const okButtonProps = useMemo(() => {
    if (isBoolean(dOkButtonProps?.dLoading)) {
      return dOkButtonProps;
    } else {
      return {
        ...dOkButtonProps,
        dLoading: okLoading,
      };
    }
  }, [dOkButtonProps, okLoading]);
  const cancelButtonProps = useMemo(() => {
    if (isBoolean(dCancelButtonProps?.dLoading)) {
      return dCancelButtonProps;
    } else {
      return {
        ...dCancelButtonProps,
        dLoading: cancelLoading,
      };
    }
  }, [dCancelButtonProps, cancelLoading]);

  const handleOkClick = useCallback(() => {
    const shouldClose = onOkClick?.();
    if (shouldClose instanceof Promise) {
      setOkLoading(true);
      shouldClose.then((val) => {
        setOkLoading(false);
        if (val !== false) {
          closeModal?.();
        }
      });
    } else if (shouldClose !== false) {
      closeModal?.();
    }
  }, [closeModal, onOkClick, setOkLoading]);
  const handleCancelClick = useCallback(() => {
    const shouldClose = onCancelClick?.();
    if (shouldClose instanceof Promise) {
      setCancelLoading(true);
      shouldClose.then((val) => {
        setCancelLoading(false);
        if (val !== false) {
          closeModal?.();
        }
      });
    } else if (shouldClose !== false) {
      closeModal?.();
    }
  }, [closeModal, onCancelClick, setCancelLoading]);

  return (
    <DFooter
      {...restProps}
      className={getClassName(className, `${dPrefix}modal-footer`)}
      dOkButtonProps={okButtonProps}
      dCancelButtonProps={cancelButtonProps}
      onOkClick={handleOkClick}
      onCancelClick={handleCancelClick}
    ></DFooter>
  );
}
