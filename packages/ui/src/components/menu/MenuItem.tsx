import { isUndefined } from 'lodash';
import { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useRefCallback, useStateBackflow } from '../../hooks';
import { getClassName, toId, mergeStyle } from '../../utils';
import { DTooltip } from '../tooltip';
import { DMenuContext } from './Menu';
import { DMenuSubContext } from './MenuSub';

export interface DMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dDisabled?: boolean;
  __level?: number;
  __inNav?: boolean;
}

export function DMenuItem(props: DMenuItemProps) {
  const {
    dId,
    dIcon,
    dDisabled = false,
    __level = 0,
    __inNav = false,
    id,
    className,
    style,
    tabIndex,
    children,
    onClick,
    onFocus,
    onBlur,
    ...restProps
  } = useComponentConfig(DMenuItem.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ menuMode, menuActiveId, onActiveChange, onFocus: _onFocus, onBlur: _onBlur }] = useCustomContext(DMenuContext);
  const [{ updateChildren, removeChildren }] = useCustomContext(DMenuSubContext);
  //#endregion

  //#region Ref
  const [liEl, liRef] = useRefCallback<HTMLLIElement>();
  //#endregion

  const _id = id ?? `${dPrefix}menu-item-${toId(dId)}`;

  useStateBackflow(updateChildren, removeChildren, dId, false);

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
          [`${dPrefix}menu-item--horizontal`]: menuMode === 'horizontal' && __inNav,
          [`${dPrefix}menu-item--icon`]: menuMode === 'icon' && __inNav,
          'is-active': menuActiveId === dId,
          'is-disabled': dDisabled,
        })}
        style={mergeStyle(style, {
          paddingLeft: 16 + __level * 20,
        })}
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
      {__inNav && menuMode === 'icon' && <DTooltip dTitle={children} dTriggerEl={liEl} dPlacement="right" />}
    </>
  );
}
