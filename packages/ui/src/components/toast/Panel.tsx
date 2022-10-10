import { isUndefined } from 'lodash';
import React from 'react';

import { useId } from '@react-devui/hooks';
import { CheckCircleOutlined, CloseCircleOutlined, CloseOutlined, ExclamationCircleOutlined, WarningOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { usePrefixConfig, useTranslation } from '../root';

export interface DPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dClassNamePrefix: string;
  dType: 'success' | 'warning' | 'error' | 'info' | undefined;
  dIcon: React.ReactNode | undefined;
  dContent: React.ReactNode;
  dActions: React.ReactNode[] | undefined;
  onClose: (() => void) | undefined;
}

function Panel(props: DPanelProps, ref: React.ForwardedRef<HTMLDivElement>): JSX.Element | null {
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
      aria-describedby={contentId}
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

export const DPanel = React.forwardRef(Panel);
