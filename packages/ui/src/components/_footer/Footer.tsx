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

const DEFAULT_PROPS = {
  dButtons: ['cancel', 'ok'],
};
export function DFooter(props: DFooterProps): JSX.Element | null {
  const {
    dAlign = 'right',
    dButtons = DEFAULT_PROPS.dButtons,
    dOkButtonProps,
    dCancelButtonProps,
    onOkClick,
    onCancelClick,
    className,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('DFooter');

  const handleCancelClick = () => {
    onCancelClick?.();
  };

  const handleOkClick = () => {
    onOkClick?.();
  };

  return (
    <div {...restProps} className={getClassName(className, `${dPrefix}footer`, `${dPrefix}footer--${dAlign}`)}>
      {dButtons.map((button, index) =>
        button === 'cancel' ? (
          <DButton key="cancel" {...dCancelButtonProps} dType="secondary" onClick={handleCancelClick}>
            {t('Cancel')}
          </DButton>
        ) : button === 'ok' ? (
          <DButton key="ok" {...dOkButtonProps} onClick={handleOkClick}>
            {t('OK')}
          </DButton>
        ) : (
          <React.Fragment key={index}>{button}</React.Fragment>
        )
      )}
    </div>
  );
}
