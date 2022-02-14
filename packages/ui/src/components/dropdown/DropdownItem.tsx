import { isUndefined } from 'lodash';

import { usePrefixConfig, useComponentConfig, useContextRequired } from '../../hooks';
import { generateComponentMate, getClassName, mergeStyle, toId } from '../../utils';
import { DDropdownContext } from './Dropdown';

export interface DDropdownItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dDisabled?: boolean;
  __level?: number;
}

const { COMPONENT_NAME } = generateComponentMate('DDropdownItem');
export function DDropdownItem(props: DDropdownItemProps): JSX.Element | null {
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
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gOnItemClick, gOnFocus, gOnBlur } = useContextRequired(DDropdownContext);
  //#endregion

  const _id = id ?? `${dPrefix}dropdown-item-${toId(dId)}`;

  const handleClick: React.MouseEventHandler<HTMLLIElement> = (e) => {
    onClick?.(e);

    !dDisabled && gOnItemClick(dId);
  };

  const handleFocus: React.FocusEventHandler<HTMLLIElement> = (e) => {
    onFocus?.(e);

    !dDisabled && gOnFocus(dId, _id);
  };

  const handleBlur: React.FocusEventHandler<HTMLLIElement> = (e) => {
    onBlur?.(e);

    gOnBlur();
  };

  return (
    <li
      {...restProps}
      id={_id}
      className={getClassName(className, `${dPrefix}dropdown-item`, {
        'is-disabled': dDisabled,
      })}
      style={mergeStyle(
        {
          paddingLeft: 12 + __level * 16,
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
      {dIcon && <div className={`${dPrefix}dropdown-item__icon`}>{dIcon}</div>}
      <div className={`${dPrefix}dropdown-item__title`}>{children}</div>
    </li>
  );
}
