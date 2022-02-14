import type { DGeneralStateContextData } from '../../hooks/general-state';
import type { DButtonProps } from './Button';

import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useGeneralState, DGeneralStateContext } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';

export interface DButtonGroupContextData {
  gType: DButtonProps['dType'];
  gTheme: DButtonProps['dTheme'];
}
export const DButtonGroupContext = React.createContext<DButtonGroupContextData | null>(null);

export interface DButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: DButtonProps['dType'];
  dTheme?: DButtonProps['dTheme'];
  dSize?: DButtonProps['dSize'];
  dDisabled?: boolean;
}

const { COMPONENT_NAME } = generateComponentMate('DButtonGroup');
export function DButtonGroup(props: DButtonGroupProps): JSX.Element | null {
  const {
    dType = 'secondary',
    dTheme = 'primary',
    dDisabled = false,
    dSize,
    className,
    children,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled;

  const generalStateContextValue = useMemo<DGeneralStateContextData>(
    () => ({
      gSize: size,
      gDisabled: disabled,
    }),
    [disabled, size]
  );

  const contextValue = useMemo<DButtonGroupContextData>(
    () => ({
      gType: dType,
      gTheme: dTheme,
    }),
    [dType, dTheme]
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
