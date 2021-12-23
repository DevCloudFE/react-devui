import { isUndefined } from 'lodash';
import React, { useCallback, useEffect } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useRefCallback, useTranslation, useStateBackflow } from '../../hooks';
import { getClassName, toId } from '../../utils';
import { DButton } from '../button';
import { DIcon } from '../icon';
import { DTabsContext } from './Tabs';

export interface DTabProps extends React.HTMLAttributes<HTMLDivElement> {
  dId: string;
  dTitle: React.ReactNode;
  dDisabled?: boolean;
  dClosable?: boolean;
  dCloseIcon?: React.ReactNode;
  __dropdown?: boolean;
}

export function DTab(props: DTabProps) {
  const {
    dId,
    dTitle,
    dDisabled = false,
    dClosable = false,
    dCloseIcon,
    __dropdown = false,
    id,
    className,
    onClick,
    ...restProps
  } = useComponentConfig(DTab.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ tabsActiveId, getDotStyle, onActiveChange, onClose }] = useCustomContext(DTabsContext);
  //#endregion

  //#region Ref
  const [tabEl, tabRef] = useRefCallback();
  //#endregion

  const [t] = useTranslation('Common');

  const _id = id ?? `${dPrefix}tab-${toId(dId)}`;

  const panelId = `${dPrefix}tabpanel-${toId(dId)}`;

  useStateBackflow(dId, tabEl);

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      if (!dDisabled) {
        onActiveChange?.(dId);
      }
    },
    [dDisabled, dId, onActiveChange, onClick]
  );

  const handleCloseClick = useCallback<React.MouseEventHandler>(
    (e) => {
      e.stopPropagation();
      onClose?.(dId);
    },
    [dId, onClose]
  );

  //#region DidUpdate
  useEffect(() => {
    if (!__dropdown && tabsActiveId === dId) {
      getDotStyle?.();
    }
  }, [__dropdown, dId, getDotStyle, tabsActiveId]);
  //#endregion

  return (
    <div
      {...restProps}
      ref={tabRef}
      id={_id}
      className={getClassName(className, `${dPrefix}tab`, {
        [`${dPrefix}tab--dropdown`]: __dropdown,
        'is-active': tabsActiveId === dId,
        'is-disabled': dDisabled,
      })}
      role="tab"
      aria-controls={panelId}
      aria-selected={tabsActiveId === dId}
      onClick={handleClick}
    >
      {dTitle}
      {dClosable && (
        <DButton
          className={`${dPrefix}tab__close`}
          tabIndex={-1}
          dType="text"
          dShape="circle"
          dIcon={
            isUndefined(dCloseIcon) ? (
              <DIcon viewBox="64 64 896 896" dSize={14}>
                <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
              </DIcon>
            ) : (
              dCloseIcon
            )
          }
          aria-label={t('Close')}
          onClick={handleCloseClick}
        ></DButton>
      )}
    </div>
  );
}
