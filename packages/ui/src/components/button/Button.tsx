import { isUndefined } from 'lodash';
import React, { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useWave, useCustomContext, useRefCallback } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { useCompose } from '../compose';
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
  dIconRight?: boolean;
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
    dIconRight = false,
    className,
    disabled,
    children,
    onClick,
    ...restProps
  } = useComponentConfig(DButton.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ buttonGroupType, buttonGroupColor, buttonGroupSize, buttonGroupDisabled }] = useCustomContext(DButtonGroupContext);
  const { composeSize, composeDisabled } = useCompose();
  //#endregion

  //#region Ref
  const [loadingEl, loadingRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const wave = useWave();

  const type = isUndefined(props.dType) ? buttonGroupType ?? dType : dType;
  const color = isUndefined(props.dColor) ? buttonGroupColor ?? dColor : dColor;
  const size = isUndefined(composeSize) ? (isUndefined(props.dSize) ? buttonGroupSize ?? dSize : dSize) : composeSize;

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      if (!dLoading && (type === 'primary' || type === 'secondary' || type === 'outline' || type === 'dashed')) {
        wave(e.currentTarget, `var(--${dPrefix}color-${color})`);
      }
    },
    [color, dLoading, dPrefix, onClick, type, wave]
  );

  const loadingIcon = (
    <DIcon viewBox="0 0 1024 1024" dSpin>
      <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
    </DIcon>
  );

  const buttonIcon = (loading: boolean, ref?: React.LegacyRef<HTMLSpanElement>) => (
    <span
      ref={ref}
      className={getClassName(`${dPrefix}button__icon`, {
        [`${dPrefix}button__icon--right`]: dIconRight,
      })}
    >
      {loading ? loadingIcon : dIcon}
    </span>
  );

  return (
    <DCollapseTransition
      dEl={loadingEl}
      dVisible={dLoading}
      dDirection="horizontal"
      dRender={(hidden) => (
        <button
          {...restProps}
          ref={ref}
          className={getClassName(className, `${dPrefix}button`, `${dPrefix}button--${type}`, `t-${color}`, {
            [`${dPrefix}button--${dShape}`]: dShape,
            [`${dPrefix}button--${size}`]: size,
            [`${dPrefix}button--block`]: dBlock,
            [`${dPrefix}button--icon`]: !children,
            'is-loading': dLoading,
          })}
          disabled={composeDisabled || buttonGroupDisabled || disabled}
          aria-disabled={composeDisabled || buttonGroupDisabled || disabled}
          onClick={handleClick}
        >
          {dIconRight && children}
          {dIcon ? buttonIcon(dLoading) : !hidden && buttonIcon(true, loadingRef)}
          {!dIconRight && children}
        </button>
      )}
    />
  );
});
