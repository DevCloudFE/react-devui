import React, { useCallback, useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig, useWave, useCustomContext } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { DIcon } from '../icon';
import { DButtonGroupContext } from './ButtonGroup';

export interface DButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dType?: 'primary' | 'secondary' | 'outline' | 'dashed' | 'text' | 'link';
  dColor?: 'primary' | 'success' | 'warning' | 'danger';
  dLoading?: boolean;
  dBlock?: boolean;
  dShape?: 'circle' | 'round';
  dSize?: 'smaller' | 'larger';
  dIcon?: React.ReactNode;
  dIconLeft?: boolean;
}

export const DButton = React.forwardRef<HTMLButtonElement, DButtonProps>((props, ref) => {
  const {
    dType,
    dColor,
    dLoading = false,
    dBlock = false,
    dShape,
    dSize,
    dIcon,
    dIconLeft = true,
    className,
    disabled,
    children,
    onClick,
    ...restProps
  } = useDComponentConfig('button', props);

  const dPrefix = useDPrefixConfig();
  const { dColor: _dColor, dSize: _dSize, dType: _dType } = useCustomContext(DButtonGroupContext);
  const wave = useWave();

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
  const type = useMemo(() => dType ?? _dType ?? 'primary', [_dType, dType]);
  const color = useMemo(() => dColor ?? _dColor ?? 'primary', [_dColor, dColor]);
  const size = useMemo(() => dSize ?? _dSize, [_dSize, dSize]);

  const dDisabled = useMemo(() => disabled || dLoading, [disabled, dLoading]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (type === 'primary' || type === 'secondary' || type === 'outline' || type === 'dashed') {
        wave.next([e.currentTarget, `var(--${dPrefix}color-${color})`]);
      }
    },
    [dPrefix, wave, color, type, onClick]
  );
  //#endregion

  const loadingIcon = (
    <DIcon dSpin>
      <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
    </DIcon>
  );

  return (
    <button
      {...restProps}
      ref={ref}
      className={getClassName(
        `${dPrefix}button`,
        `${dPrefix}button--${type}-${color}`,
        {
          [`${dPrefix}button--circle`]: dShape === 'circle',
          [`${dPrefix}button--round`]: dShape === 'round',

          [`${dPrefix}button--smaller`]: size === 'smaller',
          [`${dPrefix}button--larger`]: size === 'larger',
          'is-block': dBlock,
          'is-only-icon': !children,
        },
        className
      )}
      disabled={dDisabled}
      aria-disabled={dDisabled}
      onClick={handleClick}
    >
      {!dIconLeft && children}
      {dIcon ? (
        <span className={getClassName(`${dPrefix}button__icon`, { 'is-right': !dIconLeft })}>{dLoading ? loadingIcon : dIcon}</span>
      ) : (
        <DCollapseTransition dVisible={dLoading} dDirection="width">
          <span className={getClassName(`${dPrefix}button__icon`, { 'is-right': !dIconLeft })}>{loadingIcon}</span>
        </DCollapseTransition>
      )}
      {dIconLeft && children}
    </button>
  );
});

DButton.displayName = 'DButton';
