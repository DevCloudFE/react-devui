import React, { useCallback } from 'react';

import { useDPrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DTransition } from '../_transition';

export interface DMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export function DMask(props: DMaskProps) {
  const { dVisible, onClose, afterVisibleChange, className, onClick, ...restProps } = props;

  const dPrefix = useDPrefixConfig();

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
      onClose?.();
    },
    [onClick, onClose]
  );
  //#endregion

  return (
    <DTransition
      dVisible={dVisible}
      dStateList={{
        'enter-from': { opacity: '0' },
        'enter-to': { transition: 'opacity 0.1s linear' },
        'leave-to': { opacity: '0', transition: 'opacity 0.1s linear' },
      }}
      dCallbackList={{
        afterEnter: () => {
          afterVisibleChange?.(true);
        },
        afterLeave: () => {
          afterVisibleChange?.(false);
        },
      }}
    >
      <div {...restProps} className={getClassName(className, `${dPrefix}mask`)} onClick={handleClick}></div>
    </DTransition>
  );
}
