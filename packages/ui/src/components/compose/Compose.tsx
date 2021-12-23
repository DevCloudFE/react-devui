import type { DGeneralStateContextData } from '../../hooks/general-state';

import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useGeneralState, DGeneralStateContext } from '../../hooks';
import { getClassName } from '../../utils';

export interface DComposeProps extends React.HTMLAttributes<HTMLDivElement> {
  dSize?: 'smaller' | 'larger';
  dDisabled?: boolean;
}

export function DCompose(props: DComposeProps) {
  const { dSize, dDisabled = false, className, children, ...restProps } = useComponentConfig(DCompose.name, props);

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

  return (
    <DGeneralStateContext.Provider value={generalStateContextValue}>
      <div {...restProps} className={getClassName(className, `${dPrefix}compose`)}>
        {children}
      </div>
    </DGeneralStateContext.Provider>
  );
}
