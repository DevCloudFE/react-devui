import type { DButtonProps } from '../button';

import React from 'react';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { getClassName } from '../../utils';
import { DButton } from '../button';

export interface DFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dAlign?: 'left' | 'center' | 'right';
  dButtons?: React.ReactNode[];
  dCancelProps?: DButtonProps;
  dOkProps?: DButtonProps;
}

export function DFooter(props: DFooterProps): JSX.Element | null {
  const {
    dAlign = 'right',
    dButtons = ['cancel', 'ok'],
    dCancelProps,
    dOkProps,

    className,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('DFooter');

  return (
    <div {...restProps} className={getClassName(className, `${dPrefix}footer`, `${dPrefix}footer--${dAlign}`)}>
      {dButtons.map((button, index) =>
        button === 'cancel' ? (
          <DButton key="cancel" {...dCancelProps} dType="secondary">
            {t('Cancel')}
          </DButton>
        ) : button === 'ok' ? (
          <DButton key="ok" {...dOkProps}>
            {t('OK')}
          </DButton>
        ) : (
          <React.Fragment key={index}>{button}</React.Fragment>
        )
      )}
    </div>
  );
}
