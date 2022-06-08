import type { DFooterProps } from '../_footer';

import { useState } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DFooter } from '../_footer';

export interface DDrawerFooterProps extends DFooterProps {
  onCancelClick?: () => void | boolean | Promise<void | boolean>;
  onOkClick?: () => void | boolean | Promise<void | boolean>;
}

export interface DDrawerFooterPropsWithPrivate extends DDrawerFooterProps {
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDrawerFooter' });
export function DDrawerFooter(props: DDrawerFooterProps): JSX.Element | null {
  const { className, dCancelProps, dOkProps, onCancelClick, onOkClick, __onClose, ...restProps } = useComponentConfig(
    COMPONENT_NAME,
    props as DDrawerFooterPropsWithPrivate
  );

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [cancelLoading, setCancelLoading] = useState(false);
  const [okLoading, setOkLoading] = useState(false);

  const cancelProps: DFooterProps['dCancelProps'] = {
    ...dCancelProps,
    dLoading: dCancelProps?.dLoading || cancelLoading,
    onClick: () => {
      const shouldClose = onCancelClick?.();
      if (shouldClose instanceof Promise) {
        setCancelLoading(true);
        shouldClose.then((val) => {
          setCancelLoading(false);
          if (val !== false) {
            __onClose?.();
          }
        });
      } else if (shouldClose !== false) {
        __onClose?.();
      }
    },
  };

  const okProps: DFooterProps['dOkProps'] = {
    ...dOkProps,
    dLoading: dOkProps?.dLoading || okLoading,
    onClick: () => {
      const shouldClose = onOkClick?.();
      if (shouldClose instanceof Promise) {
        setOkLoading(true);
        shouldClose.then((val) => {
          setOkLoading(false);
          if (val !== false) {
            __onClose?.();
          }
        });
      } else if (shouldClose !== false) {
        __onClose?.();
      }
    },
  };

  return (
    <DFooter
      {...restProps}
      className={getClassName(className, `${dPrefix}drawer-footer`)}
      dCancelProps={cancelProps}
      dOkProps={okProps}
    ></DFooter>
  );
}
