import type { DFooterProps } from '../_footer';

import { isBoolean } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useImmer } from 'use-immer';

import { useDPrefixConfig, useDComponentConfig, useCustomContext } from '../../hooks';
import { getClassName } from '../../utils';
import { DFooter } from '../_footer';
import { DDrawerContext } from './Drawer';

export interface DDrawerFooterProps extends DFooterProps {
  onOkClick?: () => void | boolean | Promise<void | boolean>;
  onCancelClick?: () => void | boolean | Promise<void | boolean>;
}

export function DDrawerFooter(props: DDrawerFooterProps) {
  const { className, dOkButtonProps, dCancelButtonProps, onOkClick, onCancelClick, ...restProps } = useDComponentConfig(
    'drawer-footer',
    props
  );

  const dPrefix = useDPrefixConfig();
  const { onClose: _onClose } = useCustomContext(DDrawerContext);

  //#region States.
  /*
   * @see https://reactjs.org/docs/state-and-lifecycle.html
   *
   * - Vue: data.
   * @see https://v3.vuejs.org/api/options-data.html#data-2
   * - Angular: property on a class.
   * @example
   * export class HeroChildComponent {
   *   public data: 'example';
   * }
   */
  const [okLoading, setOkLoading] = useImmer(false);
  const [cancelLoading, setCancelLoading] = useImmer(false);
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
  const okButtonProps = useMemo(() => {
    if (isBoolean(dOkButtonProps?.dLoading)) {
      return dOkButtonProps;
    } else {
      return {
        ...dOkButtonProps,
        dLoading: okLoading,
      };
    }
  }, [dOkButtonProps, okLoading]);
  const cancelButtonProps = useMemo(() => {
    if (isBoolean(dCancelButtonProps?.dLoading)) {
      return dCancelButtonProps;
    } else {
      return {
        ...dCancelButtonProps,
        dLoading: cancelLoading,
      };
    }
  }, [dCancelButtonProps, cancelLoading]);

  const handOkClick = useCallback(() => {
    const shouldClose = onOkClick?.();
    if (shouldClose instanceof Promise) {
      setOkLoading(true);
      shouldClose.then((val) => {
        setOkLoading(false);
        if (val !== false) {
          _onClose?.();
        }
      });
    } else if (shouldClose !== false) {
      _onClose?.();
    }
  }, [_onClose, onOkClick, setOkLoading]);
  const handCancelClick = useCallback(() => {
    const shouldClose = onCancelClick?.();
    if (shouldClose instanceof Promise) {
      setCancelLoading(true);
      shouldClose.then((val) => {
        setCancelLoading(false);
        if (val !== false) {
          _onClose?.();
        }
      });
    } else if (shouldClose !== false) {
      _onClose?.();
    }
  }, [_onClose, onCancelClick, setCancelLoading]);
  //#endregion

  return (
    <DFooter
      {...restProps}
      className={getClassName(className, `${dPrefix}drawer-content__footer`)}
      dOkButtonProps={okButtonProps}
      dCancelButtonProps={cancelButtonProps}
      onOkClick={handOkClick}
      onCancelClick={handCancelClick}
    ></DFooter>
  );
}
