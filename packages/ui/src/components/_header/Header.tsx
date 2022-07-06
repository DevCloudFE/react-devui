import React from 'react';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { CloseOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { DButton } from '../button';

export interface DHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dActions?: React.ReactNode[];
  onClose?: () => void;
}

export function DHeader(props: DHeaderProps) {
  const {
    children,
    dActions = ['close'],
    onClose,

    className,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  return (
    <div {...restProps} className={getClassName(className, `${dPrefix}header`)}>
      <div className={`${dPrefix}header__title`}>{children}</div>
      <div className={`${dPrefix}header__buttons`}>
        {dActions.map((action, index) =>
          action === 'close' ? (
            <DButton
              key="close"
              aria-label={t('Close')}
              dType="text"
              dIcon={<CloseOutlined />}
              onClick={() => {
                onClose?.();
              }}
            ></DButton>
          ) : (
            <React.Fragment key={index}>{action}</React.Fragment>
          )
        )}
      </div>
    </div>
  );
}
