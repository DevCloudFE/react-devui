import type { DButtonProps } from '../button';

import React, { useState } from 'react';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { CloseOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { DButton } from '../button';

export interface DHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dActions?: React.ReactNode[];
  dCloseProps?: DButtonProps;
  onCloseClick?: () => void | boolean | Promise<void | boolean>;
  onClose?: () => void;
}

export function DHeader(props: DHeaderProps): JSX.Element | null {
  const {
    children,
    dActions = ['close'],
    dCloseProps,
    onCloseClick,
    onClose,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

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
    <div {...restProps} className={getClassName(restProps.className, `${dPrefix}header`)}>
      <div className={`${dPrefix}header__title`}>{children}</div>
      <div className={`${dPrefix}header__actions`}>
        {dActions.map((action, index) => (
          <React.Fragment key={index}>
            {action === 'close' ? (
              <DButton
                {...closeProps}
                aria-label={closeProps['aria-label'] ?? t('Close')}
                dType={closeProps.dType ?? 'text'}
                dIcon={closeProps.dIcon ?? <CloseOutlined />}
              ></DButton>
            ) : (
              action
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
