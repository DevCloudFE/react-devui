import type { DButtonProps } from './Button';

import React, { useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig } from '../../hooks';
import { getClassName } from '../../utils';

export type DButtonGroupContextData = Pick<DButtonProps, 'dType' | 'dColor' | 'dSize'> | null;
export const DButtonGroupContext = React.createContext<DButtonGroupContextData>(null);

export type DButtonGroupProps = React.HTMLAttributes<HTMLDivElement> & Pick<DButtonProps, 'dType' | 'dColor' | 'dSize'>;

export function DButtonGroup(props: DButtonGroupProps) {
  const { dType = 'secondary', dColor = 'primary', dSize, className, children, ...restProps } = useDComponentConfig('button-group', props);

  const dPrefix = useDPrefixConfig();

  const contextValue = useMemo(() => ({ dType, dColor, dSize }), [dType, dColor, dSize]);

  return (
    <DButtonGroupContext.Provider value={contextValue}>
      <div {...restProps} className={getClassName(className, `${dPrefix}button-group`)}>
        {children}
      </div>
    </DButtonGroupContext.Provider>
  );
}
