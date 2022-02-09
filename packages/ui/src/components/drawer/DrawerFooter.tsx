import type { DFooterProps } from '../_footer';

import { isBoolean } from 'lodash';
import { useCallback, useMemo, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DFooter } from '../_footer';
import { DDrawerContext } from './Drawer';

export interface DDrawerFooterProps extends DFooterProps {
  onOkClick?: () => void | boolean | Promise<void | boolean>;
  onCancelClick?: () => void | boolean | Promise<void | boolean>;
}

const { COMPONENT_NAME } = generateComponentMate('DDrawerFooter');
export function DDrawerFooter(props: DDrawerFooterProps) {
  const { className, dOkButtonProps, dCancelButtonProps, onOkClick, onCancelClick, ...restProps } = useComponentConfig(
    COMPONENT_NAME,
    props
  );

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ gCloseDrawer }] = useCustomContext(DDrawerContext);
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
          gCloseDrawer?.();
        }
      });
    } else if (shouldClose !== false) {
      gCloseDrawer?.();
    }
  }, [gCloseDrawer, onOkClick, setOkLoading]);
  const handleCancelClick = useCallback(() => {
    const shouldClose = onCancelClick?.();
    if (shouldClose instanceof Promise) {
      setCancelLoading(true);
      shouldClose.then((val) => {
        setCancelLoading(false);
        if (val !== false) {
          gCloseDrawer?.();
        }
      });
    } else if (shouldClose !== false) {
      gCloseDrawer?.();
    }
  }, [gCloseDrawer, onCancelClick, setCancelLoading]);

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
