import type { Updater } from '../../hooks/immer';
import type { DFormControl } from '../form';
import type { DValue } from './Radio';

import React, { useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig, useTwoWayBinding } from '../../hooks';
import { getClassName } from '../../utils';

export interface DRadioGroupContextData {
  radioGroupName?: string;
  radioGroupValue: DValue;
  radioGroupDisabled: boolean;
  radioGroupType: DRadioGroupProps['dType'];
  onValueChange: (checked: DValue) => void;
}
export const DRadioGroupContext = React.createContext<DRadioGroupContextData | null>(null);

export interface DRadioGroupProps extends React.HTMLAttributes<HTMLDivElement>, DFormControl {
  dValue?: [DValue, Updater<DValue>?];
  dName?: string;
  dDisabled?: boolean;
  dType?: 'outline' | 'fill';
  dSize?: 'smaller' | 'larger';
  dVertical?: boolean;
  onValueChange?: (checked: DValue) => void;
}

export function DRadioGroup(props: DRadioGroupProps) {
  const {
    dFormControlName,
    dValue,
    dName,
    dDisabled = false,
    dType,
    dSize,
    dVertical = false,
    onValueChange,
    className,
    children,
    ...restProps
  } = useDComponentConfig(DRadioGroup.name, props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  const [value, changeValue] = useTwoWayBinding(undefined, dValue, onValueChange, { name: dFormControlName });

  const contextValue = useMemo<DRadioGroupContextData>(
    () => ({
      radioGroupName: dName,
      radioGroupValue: value,
      radioGroupType: dType,
      radioGroupDisabled: dDisabled,
      onValueChange: (value) => {
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
          'is-vertical': dVertical,
        })}
        role="radiogroup"
      >
        {children}
      </div>
    </DRadioGroupContext.Provider>
  );
}
