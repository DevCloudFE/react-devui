import type { DButtonProps } from '../button';

import React, { useState } from 'react';

import { CloseOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { DButton } from '../button';

export interface DHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dClassNamePrefix: string;
  dTitleId?: string;
  dActions?: React.ReactNode[];
  dCloseProps?: DButtonProps;
  onCloseClick?: () => void | boolean | Promise<void | boolean>;
  onClose?: () => void;
}

export function DHeader(props: DHeaderProps): JSX.Element | null {
  const {
    children,
    dClassNamePrefix,
    dTitleId,
    dActions = ['close'],
    dCloseProps,
    onCloseClick,
    onClose,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const prefix = `${dPrefix}${dClassNamePrefix}`;

  const [t] = useTranslation();

  const [closeLoading, setCloseLoading] = useState(false);

  const closeProps: DHeaderProps['dCloseProps'] = {
    ...dCloseProps,
    dLoading: dCloseProps?.dLoading || closeLoading,
    onClick: () => {
      const shouldClose = onCloseClick?.();
      if (shouldClose instanceof Promise) {
        setCloseLoading(true);
        shouldClose.then((val) => {
          setCloseLoading(false);
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
    <div {...restProps} className={getClassName(restProps.className, `${prefix}__header`)}>
      <div id={dTitleId} className={`${prefix}__header-title`}>
        {children}
      </div>
      <div className={`${prefix}__header-actions`}>
        {React.Children.map(dActions, (action) =>
          action === 'close' ? (
            <DButton
              {...closeProps}
              key="$$close"
              aria-label={closeProps['aria-label'] ?? t('Close')}
              dType={closeProps.dType ?? 'text'}
              dIcon={closeProps.dIcon ?? <CloseOutlined />}
            ></DButton>
          ) : (
            action
          )
        )}
      </div>
    </div>
  );
}
