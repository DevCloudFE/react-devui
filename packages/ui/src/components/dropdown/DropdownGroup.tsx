import type { DDropdownItemProps } from './DropdownItem';

import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useTranslation } from '../../hooks';
import { getClassName, mergeStyle } from '../../utils';

export interface DDropdownGroupProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dTitle: React.ReactNode;
  __level?: number;
}

export function DDropdownGroup(props: DDropdownGroupProps) {
  const { dTitle, __level = 0, className, style, children, ...restProps } = useComponentConfig(DDropdownGroup.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('Common');

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
        style={mergeStyle(style, {
          paddingLeft: 12 + __level * 16,
        })}
        className={getClassName(className, `${dPrefix}dropdown-group`)}
        role="separator"
        aria-orientation="horizontal"
      >
        {dTitle}
      </li>
      {React.Children.count(childs) === 0 ? (
        <span
          className={`${dPrefix}dropdown-group__empty`}
          style={{
            paddingLeft: 12 + (__level + 1) * 16,
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
