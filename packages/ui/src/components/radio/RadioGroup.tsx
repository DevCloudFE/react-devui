import type { Updater } from '../../hooks/two-way-binding';
import type { DFormControl } from '../form';
import type { DValue } from './Radio';

import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding } from '../../hooks';
import { getClassName } from '../../utils';

export interface DRadioGroupContextData {
  radioGroupName?: string;
  radioGroupValue: DValue;
  radioGroupDisabled: boolean;
  radioGroupType: DRadioGroupProps['dType'];
  onModelChange: (checked: DValue) => void;
}
export const DRadioGroupContext = React.createContext<DRadioGroupContextData | null>(null);

export interface DRadioGroupProps extends React.HTMLAttributes<HTMLDivElement>, DFormControl {
  dModel?: [DValue, Updater<DValue>?];
  dName?: string;
  dDisabled?: boolean;
  dType?: 'outline' | 'fill';
  dSize?: 'smaller' | 'larger';
  dVertical?: boolean;
  onModelChange?: (checked: DValue) => void;
}

export function DRadioGroup(props: DRadioGroupProps) {
  const {
    dFormControlName,
    dModel,
    dName,
    dDisabled = false,
    dType,
    dSize,
    dVertical = false,
    onModelChange,
    className,
    children,
    ...restProps
  } = useComponentConfig(DRadioGroup.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [value, changeValue] = useTwoWayBinding(undefined, dModel, onModelChange, { name: dFormControlName });

  const contextValue = useMemo<DRadioGroupContextData>(
    () => ({
      radioGroupName: dName,
      radioGroupValue: value,
      radioGroupType: dType,
      radioGroupDisabled: dDisabled,
      onModelChange: (value) => {
        changeValue(value);
      },
    }),
    [changeValue, dDisabled, dName, dType, value]
  );

  return (
    <DRadioGroupContext.Provider value={contextValue}>
      <div
        {...restProps}
        className={getClassName(className, `${dPrefix}radio-group`, {
          [`${dPrefix}radio-group--${dType}`]: dType,
          [`${dPrefix}radio-group--${dSize}`]: dSize,
          [`${dPrefix}radio-group--vertical`]: dVertical,
        })}
        role="radiogroup"
      >
        {children}
      </div>
    </DRadioGroupContext.Provider>
  );
}
