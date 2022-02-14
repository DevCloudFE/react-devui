import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useContextOptional } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';

export interface DFormGroupContextData {
  gPath: string[];
}
export const DFormGroupContext = React.createContext<DFormGroupContextData | null>(null);

export interface DFormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  dFormGroupName: string;
  dTitle?: React.ReactNode;
}

const { COMPONENT_NAME } = generateComponentMate('DFormGroup');
export function DFormGroup(props: DFormGroupProps): JSX.Element | null {
  const { dFormGroupName, dTitle, className, children, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gPath } = useContextOptional(DFormGroupContext);
  //#endregion

  const contextValue = useMemo<DFormGroupContextData>(() => ({ gPath: (gPath ?? []).concat([dFormGroupName]) }), [dFormGroupName, gPath]);

  return (
    <DFormGroupContext.Provider value={contextValue}>
      {dTitle && (
        <div {...restProps} className={getClassName(className, `${dPrefix}form-group`)} role="separator">
          {dTitle}
        </div>
      )}
      {children}
    </DFormGroupContext.Provider>
  );
}
