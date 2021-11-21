import type { DButtonProps } from '../button';

import React, { useCallback, useMemo } from 'react';

import { useDPrefixConfig, useTranslation } from '../../hooks';
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

export function DFooter(props: DFooterProps) {
  const defaultButtons = useMemo(() => ['cancel', 'ok'], []);
  const {
    dAlign = 'right',
    dButtons = defaultButtons,
    dOkButtonProps,
    dCancelButtonProps,
    onOkClick,
    onCancelClick,
    className,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  const [t] = useTranslation('DFooter');

  const handleOkClick = useCallback(() => {
    onOkClick?.();
  }, [onOkClick]);

  const handleCancelClick = useCallback(() => {
    onCancelClick?.();
  }, [onCancelClick]);

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
