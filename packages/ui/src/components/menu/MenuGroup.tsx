import type { DMenuItemProps } from './MenuItem';

import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useTranslation } from '../../hooks';
import { getClassName, mergeStyle } from '../../utils';

export interface DMenuGroupProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dTitle: React.ReactNode;
  __level?: number;
}

export function DMenuGroup(props: DMenuGroupProps) {
  const { dId, dTitle, __level = 0, className, style, children, ...restProps } = useComponentConfig(DMenuGroup.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('Common');

  const childs = useMemo(() => {
    const length = React.Children.count(children);

    return React.Children.map(children as Array<React.ReactElement<DMenuItemProps>>, (child, index) =>
      React.cloneElement(child, {
        ...child.props,
        className: getClassName(child.props.className, {
          'js-first': length > 1 && index === 0,
          'js-last': length > 1 && index === length - 1,
        }),
        __level: __level + 1,
      })
    );
  }, [children, __level]);

  return (
    <>
      <li
        {...restProps}
        className={getClassName(className, `${dPrefix}menu-group`)}
        style={mergeStyle(style, {
          paddingLeft: 16 + __level * 20,
        })}
        role="separator"
        aria-orientation="horizontal"
      >
        {dTitle}
      </li>
      {React.Children.count(childs) === 0 ? (
        <span className={`${dPrefix}menu-group__empty`} style={{ paddingLeft: 16 + (__level + 1) * 20 }}>
          {t('No Data')}
        </span>
      ) : (
        childs
      )}
    </>
  );
}
