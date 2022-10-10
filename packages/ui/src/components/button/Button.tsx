import type { DSize } from '../../utils/types';

import React from 'react';

import { LoadingOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { useWave, useGeneralContext } from '../../hooks';
import { registerComponentMate, TTANSITION_DURING_SLOW } from '../../utils';
import { DBaseDesign } from '../_base-design';
import { DCollapseTransition } from '../_transition';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dType?: 'primary' | 'secondary' | 'outline' | 'dashed' | 'text' | 'link';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dLoading?: boolean;
  dBlock?: boolean;
  dVariant?: 'circle' | 'round';
  dSize?: DSize;
  dIcon?: React.ReactNode;
  dIconRight?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DButton' as const });
function Button(props: DButtonProps, ref: React.ForwardedRef<HTMLButtonElement>): JSX.Element | null {
  const {
    children,
    dType = 'primary',
    dTheme = 'primary',
    dLoading = false,
    dBlock = false,
    dVariant,
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
    <DBaseDesign
      dComposeDesign={{
        disabled: disabled,
      }}
      dFormDesign={false}
    >
      {({ render: renderBaseDesign }) =>
        renderBaseDesign(
          <button
            {...restProps}
            ref={ref}
            className={getClassName(restProps.className, `${dPrefix}button`, `${dPrefix}button--${dType}`, `t-${dTheme}`, {
              [`${dPrefix}button--${dVariant}`]: dVariant,
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
                dOriginalSize={{
                  width: '',
                }}
                dCollapsedStyle={{
                  width: 0,
                }}
                dIn={dLoading}
                dDuring={TTANSITION_DURING_SLOW}
                dHorizontal
                dStyles={{
                  entering: {
                    transition: ['width', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_SLOW}ms linear`).join(', '),
                  },
                  leaving: {
                    transition: ['width', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_SLOW}ms linear`).join(', '),
                  },
                  leaved: { display: 'none' },
                }}
              >
                {(collapseRef, collapseStyle) => buttonIcon(true, collapseRef, collapseStyle)}
              </DCollapseTransition>
            )}
            <div>{children}</div>
            {waveNode}
          </button>
        )
      }
    </DBaseDesign>
  );
}

export const DButton = React.forwardRef(Button);
