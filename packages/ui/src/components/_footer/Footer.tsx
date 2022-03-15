import type { DButtonProps } from '../button';

import React from 'react';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { getClassName } from '../../utils';
import { DButton } from '../button';

export interface DFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  dAlign?: 'left' | 'center' | 'right';
  dButtons?: React.ReactNode[];
  dOkButtonProps?: DButtonProps;
  dCancelButtonProps?: DButtonProps;
  onOkClick?: () => void;
  onCancelClick?: () => void;
}

export function DFooter(props: DFooterProps): JSX.Element | null {
  const {
    className,
    dAlign = 'right',
    dButtons = ['cancel', 'ok'],
    dOkButtonProps,
    dCancelButtonProps,
    onOkClick,
    onCancelClick,
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
          <DButton
            key="cancel"
            {...dCancelButtonProps}
            dType="secondary"
            onClick={() => {
              onCancelClick?.();
            }}
          >
            {t('Cancel')}
          </DButton>
        ) : button === 'ok' ? (
          <DButton
            key="ok"
            {...dOkButtonProps}
            onClick={() => {
              onOkClick?.();
            }}
          >
            {t('OK')}
          </DButton>
        ) : (
          <React.Fragment key={index}>{button}</React.Fragment>
        )
      )}
    </div>
  );
}
