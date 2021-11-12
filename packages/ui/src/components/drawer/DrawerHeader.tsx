import type { DHeaderProps } from '../_header';

import { useCallback } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext } from '../../hooks';
import { getClassName } from '../../utils';
import { DHeader } from '../_header';
import { DDrawerContext } from './Drawer';

export type DDrawerHeaderProps = Omit<DHeaderProps, 'onClose'>;

export function DDrawerHeader(props: DDrawerHeaderProps) {
  const { className, ...restProps } = useDComponentConfig('drawer-header', props);

  const dPrefix = useDPrefixConfig();
  const { id: _id, onClose: _onClose } = useCustomContext(DDrawerContext);

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
  const handClose = useCallback(() => {
    _onClose?.();
  }, [_onClose]);
  //#endregion

  return (
    <DHeader
      {...restProps}
      id={_id ? `${dPrefix}drawer-content__header-${_id}` : undefined}
      className={getClassName(className, `${dPrefix}drawer-content__header`)}
      onClose={handClose}
    ></DHeader>
  );
}
