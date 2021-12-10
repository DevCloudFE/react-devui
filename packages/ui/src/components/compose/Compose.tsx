import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { getClassName } from '../../utils';

export interface DComposeContextData {
  composeSize: DComposeProps['dSize'];
  composeDisabled: boolean;
}
export const DComposeContext = React.createContext<DComposeContextData | null>(null);

export interface DComposeProps extends React.HTMLAttributes<HTMLDivElement> {
  dSize?: 'smaller' | 'larger';
  dDisabled?: boolean;
}

export function DCompose(props: DComposeProps) {
  const { dSize, dDisabled = false, className, children, ...restProps } = useComponentConfig(DCompose.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const contextValue = useMemo<DComposeContextData>(
    () => ({
      composeSize: dSize,
      composeDisabled: dDisabled,
    }),
    [dSize, dDisabled]
  );

  return (
    <DComposeContext.Provider value={contextValue}>
      <div {...restProps} className={getClassName(className, `${dPrefix}compose`)}>
        {children}
      </div>
    </DComposeContext.Provider>
  );
}
