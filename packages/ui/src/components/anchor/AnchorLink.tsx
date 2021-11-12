import React, { useCallback, useEffect } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomRef, useCustomContext } from '../../hooks';
import { getClassName } from '../../utils';
import { DAnchorContext } from './Anchor';

export interface DAnchorLinkProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dLevel?: number;
  href?: string;
}

export function DAnchorLink(props: DAnchorLinkProps) {
  const { dLevel = 0, href, className, children, onClick, ...restProps } = useDComponentConfig('anchor-link', props);

  const dPrefix = useDPrefixConfig();
  const { activeHref: _activeHref, onClick: _onClick, currentData: _currentData } = useCustomContext(DAnchorContext);

  //#region Refs.
  /*
   * @see https://reactjs.org/docs/refs-and-the-dom.html
   *
   * - Vue: ref.
   * @see https://v3.vuejs.org/guide/component-template-refs.html
   * - Angular: ViewChild.
   * @see https://angular.io/api/core/ViewChild
   */
  const [linkEl, linkRef] = useCustomRef<HTMLLIElement>();
  //#endregion

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

      e.preventDefault();
      if (href) {
        _onClick?.(href);
      }
    },
    [_onClick, href, onClick]
  );
  //#endregion

  //#region DidUpdate.
  /*
   * We need a service(ReactConvertService) that implement useEffect.
   * @see https://reactjs.org/docs/hooks-effect.html
   *
   * - Vue: onUpdated.
   * @see https://v3.vuejs.org/api/composition-api.html#lifecycle-hooks
   * - Angular: ngDoCheck.
   * @see https://angular.io/api/core/DoCheck
   */
  useEffect(() => {
    if (linkEl && href) {
      _currentData?.links.set(href, linkEl as HTMLElement);
      return () => {
        _currentData?.links.delete(href);
      };
    }
  }, [_currentData, href, linkEl]);
  //#endregion

  return (
    <li
      {...restProps}
      ref={linkRef}
      className={getClassName(className, `${dPrefix}anchor-link`, {
        'is-active': href && _activeHref === href,
      })}
      onClick={handleClick}
    >
      <a style={{ paddingLeft: 12 + dLevel * 16 }} href={href}>
        {children}
      </a>
    </li>
  );
}
