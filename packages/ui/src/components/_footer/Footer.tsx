import type { DButtonProps } from '../button';

import React, { useCallback, useMemo } from 'react';

import { useDPrefixConfig, useTranslation } from '../../hooks';
import { getClassName } from '../../utils';
import { DButton } from '../button';

export interface DFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  dAlign: 'left' | 'center' | 'right';
  dButtons?: React.ReactNode[];
  dOkButtonProps?: DButtonProps;
  dCancelButtonProps?: DButtonProps;
  onOkClick?: () => void;
  onCancelClick?: () => void;
}

export function DFooter(props: DFooterProps) {
  const defaultButtons = useMemo(() => ['cancel', 'ok'], []);
  const {
    dAlign = 'right',
    dButtons = defaultButtons,
    dOkButtonProps,
    dCancelButtonProps,
    onOkClick,
    onCancelClick,
    className,
    ...restProps
  } = props;

  const dPrefix = useDPrefixConfig();
  const [t] = useTranslation('DFooter');

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
  const handOkClick = useCallback(() => {
    onOkClick?.();
  }, [onOkClick]);

  const handCancelClick = useCallback(() => {
    onCancelClick?.();
  }, [onCancelClick]);
  //#endregion

  return (
    <div {...restProps} className={getClassName(className, `${dPrefix}footer`, `${dPrefix}footer--${dAlign}`)}>
      {dButtons.map((button, index) =>
        button === 'cancel' ? (
          <DButton key="cancel" {...dCancelButtonProps} dType="secondary" onClick={handCancelClick}>
            {t('Cancel')}
          </DButton>
        ) : button === 'ok' ? (
          <DButton key="ok" {...dOkButtonProps} onClick={handOkClick}>
            {t('OK')}
          </DButton>
        ) : (
          <React.Fragment key={index}>{button}</React.Fragment>
        )
      )}
    </div>
  );
}
