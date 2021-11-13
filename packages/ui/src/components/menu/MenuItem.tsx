import { isUndefined } from 'lodash';
import React, { useCallback } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext } from '../../hooks';
import { getClassName, toId } from '../../utils';
import { DTrigger } from '../_trigger';
import { DTooltip } from '../tooltip';
import { DMenuContext } from './Menu';

export interface DMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dDisabled?: boolean;
  __level?: number;
  __navMenu?: boolean;
  __onFocus?: (id: string) => void;
  __onBlur?: (id: string) => void;
}

export function DMenuItem(props: DMenuItemProps) {
  const {
    dId,
    dIcon,
    dDisabled = false,
    __level = 0,
    __navMenu = false,
    __onFocus,
    __onBlur,
    className,
    style,
    tabIndex,
    children,
    onClick,
    onFocus,
    onBlur,
    ...restProps
  } = useDComponentConfig('menu-item', props);

  const dPrefix = useDPrefixConfig();
  const { dMode: _dMode, activeId: _activeId, onActiveChange: _onActiveChange } = useCustomContext(DMenuContext);

  //#region Getters.
  /*
   * When the dependency changes, recalculate the value.
   * In React, usually use `useMemo` to handle this situation.
   * Notice: `useCallback` also as getter that target at function.
   *
   * - Vue: computed.
   * @see https://v3.vuejs.org/guide/computed.html#computed-properties
   * - Angular: get property on a class.
   * @example
   * // ReactConvertService is a service that implement the
   * // methods when need to convert react to angular.
   * export class HeroChildComponent {
   *   public get data():string {
   *     return this.reactConvert.useMemo(factory, [deps]);
   *   }
   *
   *   constructor(private reactConvert: ReactConvertService) {}
   * }
   */
  const handleClick = useCallback(
    (e) => {
      onClick?.(e);
      _onActiveChange?.(dId);
    },
    [_onActiveChange, dId, onClick]
  );

  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);
      __onFocus?.(`menu-item-${toId(dId)}`);
    },
    [__onFocus, dId, onFocus]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);
      __onBlur?.(`menu-item-${toId(dId)}`);
    },
    [__onBlur, dId, onBlur]
  );
  //#endregion

  return (
    <DTrigger dDisabled={dDisabled}>
      <DTooltip dTitle={_dMode === 'icon' && __navMenu && children} dPlacement="right">
        <li
          {...restProps}
          id={`menu-item-${toId(dId)}`}
          className={getClassName(className, `${dPrefix}menu-item`, {
            'is-active': _activeId === dId,
            'is-horizontal': _dMode === 'horizontal' && __navMenu,
            'is-icon': _dMode === 'icon' && __navMenu,
          })}
          style={{
            ...style,
            paddingLeft: 16 + __level * 20,
          }}
          role="menuitem"
          tabIndex={isUndefined(tabIndex) ? -1 : tabIndex}
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
      </DTooltip>
    </DTrigger>
  );
}
