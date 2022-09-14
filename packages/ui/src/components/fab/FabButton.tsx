import React from 'react';

import { LoadingOutlined, PlusOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';

export interface DFabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dType?: 'primary' | 'secondary' | 'outline' | 'dashed' | 'text' | 'link';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dLoading?: boolean;
  dVariant?: 'circle' | 'round';
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DFab.Button' as const });
function FabButton(props: DFabButtonProps, ref: React.ForwardedRef<HTMLButtonElement>): JSX.Element | null {
  const {
    children,
    dType = 'primary',
    dTheme = 'primary',
    dLoading = false,
    dVariant,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const disabled = restProps.disabled || dLoading;

  return (
    <button
      {...restProps}
      ref={ref}
      className={getClassName(restProps.className, `${dPrefix}fab__button`, `${dPrefix}fab__button--${dType}`, `t-${dTheme}`, {
        [`${dPrefix}fab__button--${dVariant}`]: dVariant,
        'is-loading': dLoading,
      })}
      type={restProps.type ?? 'button'}
      disabled={disabled}
    >
      <PlusOutlined className={`${dPrefix}fab__close-icon`} />
      <div className={`${dPrefix}fab__button-content`}>{dLoading ? <LoadingOutlined dSpin /> : children}</div>
    </button>
  );
}

export const DFabButton = React.forwardRef(FabButton);
