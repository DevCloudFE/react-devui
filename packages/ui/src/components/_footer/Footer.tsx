import type { DButtonProps } from '../button';

import React, { useState } from 'react';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { getClassName } from '../../utils';
import { DButton } from '../button';

export interface DFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dAlign?: 'left' | 'center' | 'right';
  dButtons?: React.ReactNode[];
  dCancelProps?: DButtonProps;
  dOkProps?: DButtonProps;
  onCancelClick?: () => void | boolean | Promise<void | boolean>;
  onOkClick?: () => void | boolean | Promise<void | boolean>;
  onClose?: () => void;
}

export function DFooter(props: DFooterProps): JSX.Element | null {
  const {
    dAlign = 'right',
    dButtons = ['cancel', 'ok'],
    dCancelProps,
    dOkProps,
    onCancelClick,
    onOkClick,
    onClose,

    className,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('DFooter');

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
            onClose?.();
          }
        });
      } else if (shouldClose !== false) {
        onClose?.();
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
            onClose?.();
          }
        });
      } else if (shouldClose !== false) {
        onClose?.();
      }
    },
  };

  return (
    <div {...restProps} className={getClassName(className, `${dPrefix}footer`, `${dPrefix}footer--${dAlign}`)}>
      {dButtons.map((button, index) =>
        button === 'cancel' ? (
          <DButton key="cancel" {...cancelProps} dType="secondary">
            {t('Cancel')}
          </DButton>
        ) : button === 'ok' ? (
          <DButton key="ok" {...okProps}>
            {t('OK')}
          </DButton>
        ) : (
          <React.Fragment key={index}>{button}</React.Fragment>
        )
      )}
    </div>
  );
}
