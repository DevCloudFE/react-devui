import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext } from '../../hooks';
import { getClassName } from '../../utils';

export interface DFormGroupContextData {
  formGroupPath: string[];
}
export const DFormGroupContext = React.createContext<DFormGroupContextData | null>(null);

export interface DFormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  dFormGroupName: string;
  dTitle?: React.ReactNode;
}

export function DFormGroup(props: DFormGroupProps) {
  const { dFormGroupName, dTitle, className, children, ...restProps } = useComponentConfig(DFormGroup.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ formGroupPath }] = useCustomContext(DFormGroupContext);
  //#endregion

  const contextValue = useMemo<DFormGroupContextData>(
    () => ({ formGroupPath: (formGroupPath ?? []).concat([dFormGroupName]) }),
    [dFormGroupName, formGroupPath]
  );

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