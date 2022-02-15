import React from 'react';

import { usePrefixConfig, useComponentConfig, useTranslation } from '../../hooks';
import { generateComponentMate, getClassName, mergeStyle } from '../../utils';

export interface DMenuGroupProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dTitle: React.ReactNode;
}

export interface DMenuGroupPropsWithPrivate extends DMenuGroupProps {
  __level?: number;
}

const { COMPONENT_NAME } = generateComponentMate('DMenuGroup');
export function DMenuGroup(props: DMenuGroupProps): JSX.Element | null {
  const {
    dTitle,
    className,
    style,
    children,
    __level = 0,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DMenuGroupPropsWithPrivate);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('Common');

  const childs = (() => {
    const length = React.Children.count(children);

    return React.Children.map(children as React.ReactElement[], (child, index) =>
      React.cloneElement(child, {
        ...child.props,
        className: getClassName(child.props.className, {
          'js-first': length > 1 && index === 0,
          'js-last': length > 1 && index === length - 1,
        }),
        __level: __level + 1,
      })
    );
  })();

  return (
    <>
      <li
        {...restProps}
        className={getClassName(className, `${dPrefix}menu-group`)}
        style={mergeStyle(
          {
            paddingLeft: 16 + __level * 20,
          },
          style
        )}
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
