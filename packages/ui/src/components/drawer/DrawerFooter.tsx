import type { DFooterProps } from '../_footer';

import { isBoolean } from 'lodash';
import { useState } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DFooter } from '../_footer';

export interface DDrawerFooterProps extends DFooterProps {
  onOkClick?: () => void | boolean | Promise<void | boolean>;
  onCancelClick?: () => void | boolean | Promise<void | boolean>;
}

export interface DDrawerFooterPropsWithPrivate extends DDrawerFooterProps {
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDrawerFooter' });
export function DDrawerFooter(props: DDrawerFooterProps): JSX.Element | null {
  const { className, dOkButtonProps, dCancelButtonProps, onOkClick, onCancelClick, __onClose, ...restProps } = useComponentConfig(
    COMPONENT_NAME,
    props as DDrawerFooterPropsWithPrivate
  );

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [okLoading, setOkLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const okButtonProps = (() => {
    if (isBoolean(dOkButtonProps?.dLoading)) {
      return dOkButtonProps;
    } else {
      return {
        ...dOkButtonProps,
        dLoading: okLoading,
      };
    }
  })();
  const cancelButtonProps = (() => {
    if (isBoolean(dCancelButtonProps?.dLoading)) {
      return dCancelButtonProps;
    } else {
      return {
        ...dCancelButtonProps,
        dLoading: cancelLoading,
      };
    }
  })();

  return (
    <DFooter
      {...restProps}
      className={getClassName(className, `${dPrefix}drawer-footer`)}
      dOkButtonProps={okButtonProps}
      dCancelButtonProps={cancelButtonProps}
      onOkClick={() => {
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
      }}
      onCancelClick={() => {
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
      }}
    ></DFooter>
  );
}
