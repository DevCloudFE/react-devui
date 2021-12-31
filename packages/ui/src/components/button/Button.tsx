import { isUndefined } from 'lodash';
import React, { useCallback } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useWave,
  useCustomContext,
  useGeneralState,
  useDCollapseTransition,
  useRefCallback,
} from '../../hooks';
import { getClassName } from '../../utils';
import { DIcon } from '../icon';
import { DButtonGroupContext } from './ButtonGroup';

export type DButtonRef = HTMLButtonElement;

export interface DButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dType?: 'primary' | 'secondary' | 'outline' | 'dashed' | 'text' | 'link';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dLoading?: boolean;
  dBlock?: boolean;
  dShape?: 'circle' | 'round';
  dSize?: 'smaller' | 'larger';
  dIcon?: React.ReactNode;
  dIconRight?: boolean;
}

const Button: React.ForwardRefRenderFunction<DButtonRef, DButtonProps> = (props, ref) => {
  const {
    dType = 'primary',
    dTheme = 'primary',
    dLoading = false,
    dBlock = false,
    dShape,
    dSize,
    dIcon,
    dIconRight = false,
    className,
    type = 'button',
    disabled,
    children,
    onClick,
    ...restProps
  } = useComponentConfig(DButton.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  const [{ buttonGroupType, buttonGroupTheme, buttonGroupDisabled }] = useCustomContext(DButtonGroupContext);
  //#endregion

  //#region Ref
  const [loadingEl, loadingRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const wave = useWave();

  const buttonType = isUndefined(props.dType) ? buttonGroupType ?? dType : dType;
  const theme = isUndefined(props.dTheme) ? buttonGroupTheme ?? dTheme : dTheme;
  const size = dSize ?? gSize;
  const _disabled = disabled || buttonGroupDisabled || gDisabled;

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      if (!dLoading && (buttonType === 'primary' || buttonType === 'secondary' || buttonType === 'outline' || buttonType === 'dashed')) {
        wave(e.currentTarget, `var(--${dPrefix}color-${theme})`);
      }
    },
    [theme, dLoading, dPrefix, onClick, buttonType, wave]
  );

  const buttonIcon = (loading: boolean, ref?: React.LegacyRef<HTMLSpanElement>) => (
    <span
      ref={ref}
      className={getClassName(`${dPrefix}button__icon`, {
        [`${dPrefix}button__icon--right`]: dIconRight,
      })}
    >
      {loading ? (
        <DIcon viewBox="0 0 1024 1024" dSpin>
          <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
        </DIcon>
      ) : (
        dIcon
      )}
    </span>
  );

  const transitionState = {
    'enter-from': { width: '0' },
    'enter-to': { transition: 'width 0.3s linear' },
    'leave-to': { width: '0', transition: 'width 0.3s linear' },
  };
  const hidden = useDCollapseTransition({
    dEl: loadingEl,
    dVisible: dLoading,
    dCallbackList: {
      beforeEnter: () => transitionState,
      beforeLeave: () => transitionState,
    },
    dDirection: 'horizontal',
  });

  return (
    <button
      {...restProps}
      ref={ref}
      className={getClassName(className, `${dPrefix}button`, `${dPrefix}button--${buttonType}`, `t-${theme}`, {
        [`${dPrefix}button--${dShape}`]: dShape,
        [`${dPrefix}button--${size}`]: size,
        [`${dPrefix}button--block`]: dBlock,
        [`${dPrefix}button--icon`]: !children,
        'is-loading': dLoading,
      })}
      type={type}
      disabled={_disabled}
      aria-disabled={_disabled}
      onClick={handleClick}
    >
      {dIconRight && children}
      {dIcon ? buttonIcon(dLoading) : !hidden && buttonIcon(true, loadingRef)}
      {!dIconRight && children}
    </button>
  );
};

export const DButton = React.forwardRef(Button);
