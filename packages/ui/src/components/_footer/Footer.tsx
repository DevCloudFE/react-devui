import type { DButtonProps } from '../button';

import React, { useState } from 'react';

import { getClassName } from '@react-devui/utils';

import { DButton } from '../button';
import { usePrefixConfig, useTranslation } from '../root';

export interface DFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dClassNamePrefix: string;
  dAlign: 'left' | 'center' | 'right';
  dActions: React.ReactNode[];
  dCancelProps: DButtonProps | undefined;
  dOkProps: DButtonProps | undefined;
  onCancelClick: (() => void | boolean | Promise<boolean>) | undefined;
  onOkClick: (() => void | boolean | Promise<boolean>) | undefined;
  onClose: (() => void) | undefined;
}

export function DFooter(props: DFooterProps): JSX.Element | null {
  const {
    dClassNamePrefix,
    dAlign,
    dActions,
    dCancelProps,
    dOkProps,
    onCancelClick,
    onOkClick,
    onClose,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const prefix = `${dPrefix}${dClassNamePrefix}`;

  const [t] = useTranslation();

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
    <div {...restProps} className={getClassName(restProps.className, `${prefix}__footer`, `${prefix}__footer--${dAlign}`)}>
      {React.Children.map(dActions, (action) =>
        action === 'cancel' ? (
          <DButton {...cancelProps} key="$$cancel" dType={cancelProps.dType ?? 'secondary'}>
            {cancelProps.children ?? t('Footer', 'Cancel')}
          </DButton>
        ) : action === 'ok' ? (
          <DButton {...okProps} key="$$ok">
            {okProps.children ?? t('Footer', 'OK')}
          </DButton>
        ) : (
          action
        )
      )}
    </div>
  );
}
