import { isUndefined } from 'lodash';
import React, { useId } from 'react';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { CheckCircleOutlined, CloseCircleOutlined, CloseOutlined, ExclamationCircleOutlined, WarningOutlined } from '../../icons';
import { getClassName, checkNodeExist } from '../../utils';

export interface DToastPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dClassNamePrefix: string;
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dContent: React.ReactNode;
  dActions?: React.ReactNode[];
  onClose?: () => void;
}

function ToastPanel(props: DToastPanelProps, ref: React.ForwardedRef<HTMLDivElement>): JSX.Element | null {
  const {
    dClassNamePrefix,
    dType,
    dIcon,
    dContent,
    dActions = ['close'],
    onClose,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const prefix = `${dPrefix}${dClassNamePrefix}`;

  const [t] = useTranslation();

  const uniqueId = useId();
  const contentId = `${prefix}-content-${uniqueId}`;

  return (
    <div
      {...restProps}
      ref={ref}
      className={getClassName(restProps.className, prefix, {
        [`t-${dType === 'info' ? 'primary' : dType === 'error' ? 'danger' : dType}`]: dType,
      })}
      aria-describedby={restProps['aria-describedby'] ?? contentId}
    >
      {dIcon !== false && (!isUndefined(dType) || checkNodeExist(dIcon)) && (
        <div className={`${prefix}__icon`}>
          {checkNodeExist(dIcon)
            ? dIcon
            : React.createElement(
                dType === 'success'
                  ? CheckCircleOutlined
                  : dType === 'warning'
                  ? WarningOutlined
                  : dType === 'error'
                  ? CloseCircleOutlined
                  : ExclamationCircleOutlined
              )}
        </div>
      )}
      <div id={contentId} className={getClassName(`${prefix}__content`)}>
        {dContent}
      </div>
      <div className={`${prefix}__actions`}>
        {React.Children.map(dActions, (action) =>
          action === 'close' ? (
            <button key="$$close" className={`${prefix}__close`} aria-label={t('Close')} onClick={onClose}>
              <CloseOutlined dSize="1.2em" />
            </button>
          ) : (
            action
          )
        )}
      </div>
    </div>
  );
}

export const DToastPanel = React.forwardRef(ToastPanel);
