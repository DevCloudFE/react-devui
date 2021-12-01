import { isUndefined } from 'lodash';
import { useCallback } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext } from '../../hooks';
import { getClassName, toId } from '../../utils';
import { DDropdownContext } from './Dropdown';

export interface DDropdownItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dDisabled?: boolean;
}

export function DDropdownItem(props: DDropdownItemProps) {
  const {
    dId,
    dIcon,
    dDisabled = false,
    id,
    className,
    tabIndex,
    children,
    onClick,
    onFocus,
    onBlur,
    ...restProps
  } = useDComponentConfig('dropdown-item', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const [{ onItemClick, onFocus: _onFocus, onBlur: _onBlur }] = useCustomContext(DDropdownContext);
  //#endregion

  const _id = id ?? `${dPrefix}dropdown-item-${toId(dId)}`;

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      !dDisabled && onItemClick?.(dId);
    },
    [dDisabled, dId, onClick, onItemClick]
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
    <li
      {...restProps}
      id={_id}
      className={getClassName(className, `${dPrefix}dropdown-item`, {
        'is-disabled': dDisabled,
      })}
      role="menuitem"
      tabIndex={isUndefined(tabIndex) ? -1 : tabIndex}
      aria-disabled={dDisabled}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {dIcon && <div className={`${dPrefix}dropdown-item__icon`}>{dIcon}</div>}
      <div className={`${dPrefix}dropdown-item__title`}>{children}</div>
    </li>
  );
}
