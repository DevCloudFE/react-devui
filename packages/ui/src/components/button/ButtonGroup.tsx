import type { DButtonProps } from './Button';

import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { getClassName } from '../../utils';

export interface DButtonGroupContextData {
  buttonGroupType: DButtonProps['dType'];
  buttonGroupTheme: DButtonProps['dTheme'];
  buttonGroupSize: DButtonProps['dSize'];
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
  //#endregion

  const contextValue = useMemo<DButtonGroupContextData>(
    () => ({
      buttonGroupType: dType,
      buttonGroupTheme: dTheme,
      buttonGroupSize: dSize,
      buttonGroupDisabled: dDisabled,
    }),
    [dType, dTheme, dSize, dDisabled]
  );

  return (
    <DButtonGroupContext.Provider value={contextValue}>
      <div {...restProps} className={getClassName(className, `${dPrefix}button-group`)}>
        {children}
      </div>
    </DButtonGroupContext.Provider>
  );
}
