import type { DFooterProps } from '../_footer';

import { isBoolean } from 'lodash';
import { useCallback, useMemo, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext } from '../../hooks';
import { getClassName } from '../../utils';
import { DFooter } from '../_footer';
import { DDrawerContext } from './Drawer';

export interface DDrawerFooterProps extends DFooterProps {
  onOkClick?: () => void | boolean | Promise<void | boolean>;
  onCancelClick?: () => void | boolean | Promise<void | boolean>;
}

export function DDrawerFooter(props: DDrawerFooterProps) {
  const { className, dOkButtonProps, dCancelButtonProps, onOkClick, onCancelClick, ...restProps } = useComponentConfig(
    DDrawerFooter.name,
    props
  );

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ closeDrawer }] = useCustomContext(DDrawerContext);
  //#endregion

  const [okLoading, setOkLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

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
          closeDrawer?.();
        }
      });
    } else if (shouldClose !== false) {
      closeDrawer?.();
    }
  }, [closeDrawer, onOkClick, setOkLoading]);
  const handleCancelClick = useCallback(() => {
    const shouldClose = onCancelClick?.();
    if (shouldClose instanceof Promise) {
      setCancelLoading(true);
      shouldClose.then((val) => {
        setCancelLoading(false);
        if (val !== false) {
          closeDrawer?.();
        }
      });
    } else if (shouldClose !== false) {
      closeDrawer?.();
    }
  }, [closeDrawer, onCancelClick, setCancelLoading]);

  return (
    <DFooter
      {...restProps}
      className={getClassName(className, `${dPrefix}drawer-footer`)}
      dOkButtonProps={okButtonProps}
      dCancelButtonProps={cancelButtonProps}
      onOkClick={handleOkClick}
      onCancelClick={handleCancelClick}
    ></DFooter>
  );
}
