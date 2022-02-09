import { isUndefined } from 'lodash';
import { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useRefCallback, useIsomorphicLayoutEffect } from '../../hooks';
import { getClassName, toId, mergeStyle, generateComponentMate } from '../../utils';
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

const { COMPONENT_NAME } = generateComponentMate('DMenuItem');
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
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ gMode, gActiveId, gOnActiveChange, gOnFocus, gOnBlur }] = useCustomContext(DMenuContext);
  const [{ gUpdateChildren, gRemoveChildren }] = useCustomContext(DMenuSubContext);
  //#endregion

  //#region Ref
  const [liEl, liRef] = useRefCallback<HTMLLIElement>();
  //#endregion

  const _id = id ?? `${dPrefix}menu-item-${toId(dId)}`;

  useIsomorphicLayoutEffect(() => {
    gUpdateChildren?.(dId, dId, false);
    return () => {
      gRemoveChildren?.(dId);
    };
  }, [dId, gRemoveChildren, gUpdateChildren]);

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      !dDisabled && gOnActiveChange?.(dId);
    },
    [dDisabled, dId, gOnActiveChange, onClick]
  );

  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);

      !dDisabled && gOnFocus?.(dId, _id);
    },
    [_id, gOnFocus, dDisabled, dId, onFocus]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);

      gOnBlur?.();
    },
    [gOnBlur, onBlur]
  );

  return (
    <>
      <li
        {...restProps}
        ref={liRef}
        id={_id}
        className={getClassName(className, `${dPrefix}menu-item`, {
          [`${dPrefix}menu-item--horizontal`]: gMode === 'horizontal' && __inNav,
          [`${dPrefix}menu-item--icon`]: gMode === 'icon' && __inNav,
          'is-active': gActiveId === dId,
          'is-disabled': dDisabled,
        })}
        style={mergeStyle(
          {
            paddingLeft: 16 + __level * 20,
          },
          style
        )}
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
      {__inNav && gMode === 'icon' && <DTooltip dTitle={children} dTriggerEl={liEl} dPlacement="right" />}
    </>
  );
}
