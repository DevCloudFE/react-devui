import type { DSize } from '../../utils/global';

import React from 'react';

import { usePrefixConfig, useComponentConfig, useWave, useGeneralContext } from '../../hooks';
import { LoadingOutlined } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { TTANSITION_DURING_SLOW } from '../../utils/global';
import { DBaseDesign } from '../_base-design';
import { DCollapseTransition } from '../_transition';

export interface DButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dType?: 'primary' | 'secondary' | 'outline' | 'dashed' | 'text' | 'link';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dLoading?: boolean;
  dBlock?: boolean;
  dShape?: 'circle' | 'round';
  dSize?: DSize;
  dIcon?: React.ReactNode;
  dIconRight?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DButton' });
function Button(props: DButtonProps, ref: React.ForwardedRef<HTMLButtonElement>): JSX.Element | null {
  const {
    children,
    dType = 'primary',
    dTheme = 'primary',
    dLoading = false,
    dBlock = false,
    dShape,
    dSize,
    dIcon,
    dIconRight = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const [waveNode, wave] = useWave();

  const size = dSize ?? gSize;
  const disabled = restProps.disabled || dLoading || gDisabled;

  const buttonIcon = (loading: boolean, iconRef?: React.RefObject<HTMLDivElement>, style?: React.CSSProperties) => (
    <div ref={iconRef} className={`${dPrefix}button__icon`} style={style}>
      {loading ? <LoadingOutlined dSpin /> : dIcon}
    </div>
  );

  return (
    <DBaseDesign dCompose={{ disabled: disabled }}>
      <button
        {...restProps}
        ref={ref}
        className={getClassName(restProps.className, `${dPrefix}button`, `${dPrefix}button--${dType}`, `t-${dTheme}`, {
          [`${dPrefix}button--${dShape}`]: dShape,
          [`${dPrefix}button--${size}`]: size,
          [`${dPrefix}button--block`]: dBlock,
          [`${dPrefix}button--icon`]: !children,
          [`${dPrefix}button--icon-right`]: dIconRight,
          'is-loading': dLoading,
        })}
        type={restProps.type ?? 'button'}
        disabled={disabled}
        onClick={(e) => {
          restProps.onClick?.(e);

          if (dType === 'primary' || dType === 'secondary' || dType === 'outline' || dType === 'dashed') {
            wave(`var(--${dPrefix}color-${dTheme})`);
          }
        }}
      >
        {dIcon ? (
          buttonIcon(dLoading)
        ) : (
          <DCollapseTransition
            dSize={0}
            dIn={dLoading}
            dDuring={TTANSITION_DURING_SLOW}
            dHorizontal
            dStyles={{
              entering: { transition: `width ${TTANSITION_DURING_SLOW}ms linear` },
              leaving: { transition: `width ${TTANSITION_DURING_SLOW}ms linear` },
              leaved: { display: 'none' },
            }}
          >
            {(iconRef, collapseStyle) => buttonIcon(true, iconRef, collapseStyle)}
          </DCollapseTransition>
        )}
        <div>{children}</div>
        {waveNode}
      </button>
    </DBaseDesign>
  );
}

export const DButton = React.forwardRef(Button);
