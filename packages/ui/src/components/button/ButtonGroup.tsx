import type { DGeneralStateContextData } from '../../hooks/general-state';
import type { DButtonProps } from './Button';

import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useGeneralState, DGeneralStateContext } from '../../hooks';
import { getClassName } from '../../utils';

export interface DButtonGroupContextData {
  buttonGroupType: DButtonProps['dType'];
  buttonGroupTheme: DButtonProps['dTheme'];
  buttonGroupDisabled: boolean;
}
export const DButtonGroupContext = React.createContext<DButtonGroupContextData | null>(null);

export interface DButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: DButtonProps['dType'];
  dTheme?: DButtonProps['dTheme'];
  dSize?: DButtonProps['dSize'];
  dDisabled?: boolean;
}

export function DButtonGroup(props: DButtonGroupProps) {
  const {
    dType = 'secondary',
    dTheme = 'primary',
    dDisabled = false,
    dSize,
    className,
    children,
    ...restProps
  } = useComponentConfig(DButtonGroup.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled;

  const contextValue = useMemo<DButtonGroupContextData>(
    () => ({
      buttonGroupType: dType,
      buttonGroupTheme: dTheme,
      buttonGroupDisabled: dDisabled,
    }),
    [dType, dTheme, dDisabled]
  );

  const generalStateContextValue = useMemo<DGeneralStateContextData>(
    () => ({
      gSize: size,
      gDisabled: disabled,
    }),
    [disabled, size]
  );

  return (
    <DGeneralStateContext.Provider value={generalStateContextValue}>
      <DButtonGroupContext.Provider value={contextValue}>
        <div {...restProps} className={getClassName(className, `${dPrefix}button-group`)}>
          {children}
        </div>
      </DButtonGroupContext.Provider>
    </DGeneralStateContext.Provider>
  );
}
