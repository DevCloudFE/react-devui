import type { DButtonProps } from './Button';

import React, { useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig } from '../../hooks';
import { getClassName } from '../../utils';

export interface DButtonGroupContextData {
  buttonGroupType: DButtonProps['dType'];
  buttonGroupColor: DButtonProps['dColor'];
  buttonGroupSize: DButtonProps['dSize'];
}
export const DButtonGroupContext = React.createContext<DButtonGroupContextData | null>(null);

export interface DButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: DButtonProps['dType'];
  dColor?: DButtonProps['dColor'];
  dSize?: DButtonProps['dSize'];
}

export function DButtonGroup(props: DButtonGroupProps) {
  const { dType = 'secondary', dColor = 'primary', dSize, className, children, ...restProps } = useDComponentConfig('button-group', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  const contextValue = useMemo<DButtonGroupContextData>(
    () => ({
      buttonGroupType: dType,
      buttonGroupColor: dColor,
      buttonGroupSize: dSize,
    }),
    [dType, dColor, dSize]
  );

  return (
    <DButtonGroupContext.Provider value={contextValue}>
      <div {...restProps} className={getClassName(className, `${dPrefix}button-group`)}>
        {children}
      </div>
    </DButtonGroupContext.Provider>
  );
}
