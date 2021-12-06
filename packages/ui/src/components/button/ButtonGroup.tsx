import type { DButtonProps } from './Button';

import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { getClassName } from '../../utils';

export interface DButtonGroupContextData {
  buttonGroupType: DButtonProps['dType'];
  buttonGroupColor: DButtonProps['dColor'];
  buttonGroupSize: DButtonProps['dSize'];
  buttonGroupDisabled: boolean;
}
export const DButtonGroupContext = React.createContext<DButtonGroupContextData | null>(null);

export interface DButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: DButtonProps['dType'];
  dColor?: DButtonProps['dColor'];
  dSize?: DButtonProps['dSize'];
  dDisabled?: boolean;
}

export function DButtonGroup(props: DButtonGroupProps) {
  const {
    dType = 'secondary',
    dColor = 'primary',
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
      buttonGroupColor: dColor,
      buttonGroupSize: dSize,
      buttonGroupDisabled: dDisabled,
    }),
    [dType, dColor, dSize, dDisabled]
  );

  return (
    <DButtonGroupContext.Provider value={contextValue}>
      <div {...restProps} className={getClassName(className, `${dPrefix}button-group`)}>
        {children}
      </div>
    </DButtonGroupContext.Provider>
  );
}
