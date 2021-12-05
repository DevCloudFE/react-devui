import type { DMenuItemProps } from './MenuItem';

import { isUndefined } from 'lodash';
import React, { useCallback, useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext, useTranslation } from '../../hooks';
import { getClassName, toId, mergeStyle } from '../../utils';
import { DMenuContext } from './Menu';

export interface DMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  dId: string;
  dTitle: React.ReactNode;
  __level?: number;
}

export function DMenuGroup(props: DMenuGroupProps) {
  const {
    dId,
    dTitle,
    __level = 0,
    id,
    className,
    style,
    tabIndex,
    children,
    onFocus,
    onBlur,
    ...restProps
  } = useDComponentConfig(DMenuGroup.name, props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const [{ onFocus: _onFocus, onBlur: _onBlur }] = useCustomContext(DMenuContext);
  //#endregion

  const [t] = useTranslation('Common');

  const _id = id ?? `${dPrefix}menu-group-${toId(dId)}`;

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
      <div
        {...restProps}
        id={_id}
        className={getClassName(className, `${dPrefix}menu-group`)}
        style={mergeStyle(style, {
          paddingLeft: 16 + __level * 20,
        })}
        tabIndex={isUndefined(tabIndex) ? -1 : tabIndex}
        role="separator"
        aria-orientation="horizontal"
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {dTitle}
      </div>
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
