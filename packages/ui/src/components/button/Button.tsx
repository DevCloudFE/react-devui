import { isUndefined } from 'lodash';
import React, { useCallback } from 'react';

import { useDPrefixConfig, useDComponentConfig, useWave, useCustomContext, useCustomRef } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { DIcon } from '../icon';
import { DButtonGroupContext } from './ButtonGroup';

export type DButtonRef = HTMLButtonElement;

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

export const DButton = React.forwardRef<DButtonRef, DButtonProps>((props, ref) => {
  const {
    dType = 'primary',
    dColor = 'primary',
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

  //#region Context
  const dPrefix = useDPrefixConfig();
  const { buttonGroupType, buttonGroupColor, buttonGroupSize } = useCustomContext(DButtonGroupContext);
  //#endregion

  //#region Ref
  const [loadingEl, loadingRef] = useCustomRef<HTMLElement>();
  //#endregion

  const wave = useWave();

  const type = isUndefined(props.dType) ? buttonGroupType ?? dType : dType;
  const color = isUndefined(props.dColor) ? buttonGroupColor ?? dColor : dColor;
  const size = isUndefined(props.dSize) ? buttonGroupSize ?? dSize : dSize;
  const _disabled = disabled || dLoading;

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);
      if (type === 'primary' || type === 'secondary' || type === 'outline' || type === 'dashed') {
        wave.next([e.currentTarget, `var(--${dPrefix}color-${color})`]);
      }
    },
    [color, dPrefix, onClick, type, wave]
  );

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
      disabled={_disabled}
      aria-disabled={_disabled}
      onClick={handleClick}
    >
      {!dIconLeft && children}
      {dIcon ? (
        <span className={getClassName(`${dPrefix}button__icon`, { 'is-right': !dIconLeft })}>{dLoading ? loadingIcon : dIcon}</span>
      ) : (
        <DCollapseTransition dEl={loadingEl} dVisible={dLoading} dDirection="width" dDestroy>
          <span ref={loadingRef} className={getClassName(`${dPrefix}button__icon`, { 'is-right': !dIconLeft })}>
            {loadingIcon}
          </span>
        </DCollapseTransition>
      )}
      {dIconLeft && children}
    </button>
  );
});
