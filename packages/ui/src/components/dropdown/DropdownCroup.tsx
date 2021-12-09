import type { DDropdownItemProps } from './DropdownItem';

import React, { useCallback, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useTranslation } from '../../hooks';
import { getClassName, mergeStyle, toId } from '../../utils';
import { DDropdownContext } from './Dropdown';

export interface DDropdownGroupProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dTitle: React.ReactNode;
  __level?: number;
}

export function DDropdownGroup(props: DDropdownGroupProps) {
  const {
    dId,
    dTitle,
    __level = 0,
    id,
    className,
    style,
    tabIndex = -1,
    children,
    onClick,
    onFocus,
    onBlur,
    ...restProps
  } = useComponentConfig(DDropdownGroup.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ onFocus: _onFocus, onBlur: _onBlur }] = useCustomContext(DDropdownContext);
  //#endregion

  const [t] = useTranslation('Common');

  const _id = id ?? `${dPrefix}dropdown-group-${toId(dId)}`;

  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);
      _onFocus?.(dId, _id);
    },
    [_id, _onFocus, dId, onFocus]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);
      _onBlur?.();
    },
    [_onBlur, onBlur]
  );

  const childs = useMemo(() => {
    return React.Children.map(children as Array<React.ReactElement<DDropdownItemProps>>, (child) =>
      React.cloneElement(child, {
        ...child.props,
        __level: __level + 1,
      })
    );
  }, [children, __level]);

  return (
    <>
      <li
        {...restProps}
        id={_id}
        style={mergeStyle(style, {
          paddingLeft: 12 + __level * 16,
        })}
        className={getClassName(className, `${dPrefix}dropdown-group`)}
        tabIndex={tabIndex}
        role="separator"
        aria-orientation="horizontal"
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {dTitle}
      </li>
      {React.Children.count(childs) === 0 ? (
        <span
          className={`${dPrefix}dropdown-group__empty`}
          style={{
            paddingLeft: style?.paddingLeft,
          }}
        >
          {t('No Data')}
        </span>
      ) : (
        childs
      )}
    </>
  );
}
