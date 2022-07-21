import React from 'react';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { CloseOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { DButton } from '../button';

export interface DHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dActions?: React.ReactNode[];
  onClose?: () => void;
}

export function DHeader(props: DHeaderProps): JSX.Element | null {
  const {
    children,
    dActions = ['close'],
    onClose,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  return (
    <div {...restProps} className={getClassName(restProps.className, `${dPrefix}header`)}>
      <div className={`${dPrefix}header__title`}>{children}</div>
      <div className={`${dPrefix}header__actions`}>
        {dActions.map((action, index) => (
          <React.Fragment key={index}>
            {action === 'close' ? (
              <DButton
                aria-label={t('Close')}
                dType="text"
                dIcon={<CloseOutlined />}
                onClick={() => {
                  onClose?.();
                }}
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
