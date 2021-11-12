import { isUndefined } from 'lodash';
import React, { useCallback, useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext } from '../../hooks';
import { getClassName, toId } from '../../utils';
import { DMenuContext } from './Menu';
import { generateChildren, isMenuComponent } from './utils';

export interface DMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  dTitle: React.ReactNode;
  __id?: string;
  __level?: number;
  __onFocus?: (id: string) => void;
  __onBlur?: (id: string) => void;
}

export function DMenuGroup(props: DMenuGroupProps) {
  const {
    dTitle,
    __id = '',
    __level = 0,
    __onFocus,
    __onBlur,
    className,
    style,
    tabIndex,
    children,
    onFocus,
    onBlur,
    ...restProps
  } = useDComponentConfig('menu-group', props);

  const dPrefix = useDPrefixConfig();
  const { currentData: _currentData } = useCustomContext(DMenuContext);

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
  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);
      __onFocus?.(`menu-group-${toId(__id)}`);
    },
    [__id, __onFocus, onFocus]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);
      __onBlur?.(`menu-group-${toId(__id)}`);
    },
    [__id, __onBlur, onBlur]
  );
  //#endregion

  //#region React.cloneElement.
  /*
   * @see https://reactjs.org/docs/react-api.html#cloneelement
   *
   * - Vue: Scoped Slots.
   * @see https://v3.vuejs.org/guide/component-slots.html#scoped-slots
   * - Angular: NgTemplateOutlet.
   * @see https://angular.io/api/common/NgTemplateOutlet
   */
  const childs = useMemo(() => {
    const arr: string[] = [];
    const _childs = generateChildren(children, true).map((child) => {
      if (isMenuComponent(child)) {
        arr.push(child.props.__id);
        return React.cloneElement(child, {
          ...child.props,
          __level: __level + 1,
          __onFocus: (id: string) => {
            __onFocus?.(id);
          },
          __onBlur: (id: string) => {
            __onBlur?.(id);
          },
        });
      }

      return child;
    });
    _currentData?.ids.set(__id, arr);
    return _childs;
  }, [__id, __level, __onFocus, __onBlur, _currentData, children]);
  //#endregion

  return (
    <>
      <div
        {...restProps}
        id={`menu-group-${toId(__id)}`}
        className={getClassName(className, `${dPrefix}menu-group`)}
        style={{
          ...style,
          paddingLeft: 16 + __level * 20,
        }}
        tabIndex={isUndefined(tabIndex) ? -1 : tabIndex}
        role="separator"
        aria-orientation="horizontal"
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {dTitle}
      </div>
      {childs}
    </>
  );
}
