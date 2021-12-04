import { isUndefined } from 'lodash';
import { useCallback } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext, useRefCallback } from '../../hooks';
import { getClassName, toId } from '../../utils';
import { DTooltip } from '../tooltip';
import { DMenuContext } from './Menu';

export interface DMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dDisabled?: boolean;
  __level?: number;
}

export function DMenuItem(props: DMenuItemProps) {
  const {
    dId,
    dIcon,
    dDisabled = false,
    __level = 0,
    id,
    className,
    style,
    tabIndex,
    children,
    onClick,
    onFocus,
    onBlur,
    ...restProps
  } = useDComponentConfig(DMenuItem.name, props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const [{ menuMode, menuActiveId, menuCurrentData, onActiveChange, onFocus: _onFocus, onBlur: _onBlur }] = useCustomContext(DMenuContext);
  //#endregion

  //#region Ref
  const [liEl, liRef] = useRefCallback<HTMLLIElement>();
  //#endregion

  const inNav = menuCurrentData?.navIds.has(dId) ?? false;
  const _id = id ?? `${dPrefix}menu-item-${toId(dId)}`;

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      !dDisabled && onActiveChange?.(dId);
    },
    [dDisabled, dId, onActiveChange, onClick]
  );

  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);

      !dDisabled && _onFocus?.(dId, _id);
    },
    [_id, _onFocus, dDisabled, dId, onFocus]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);
      _onBlur?.();
    },
    [_onBlur, onBlur]
  );

  return (
    <>
      <li
        {...restProps}
        ref={liRef}
        id={_id}
        className={getClassName(className, `${dPrefix}menu-item`, {
          [`${dPrefix}menu-item--horizontal`]: menuMode === 'horizontal' && inNav,
          [`${dPrefix}menu-item--icon`]: menuMode === 'icon' && inNav,
          'is-active': menuActiveId === dId,
          'is-disabled': dDisabled,
        })}
        style={{
          ...style,
          paddingLeft: 16 + __level * 20,
        }}
        role="menuitem"
        tabIndex={isUndefined(tabIndex) ? -1 : tabIndex}
        aria-disabled={dDisabled}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <div className={`${dPrefix}menu-item__indicator`}>
          <div style={{ backgroundColor: __level === 0 ? 'transparent' : undefined }}></div>
        </div>
        {dIcon && <div className={`${dPrefix}menu-item__icon`}>{dIcon}</div>}
        <div className={`${dPrefix}menu-item__title`}>{children}</div>
      </li>
      {inNav && menuMode === 'icon' && <DTooltip dTitle={children} dTriggerEl={liEl} dPlacement="right" />}
    </>
  );
}
