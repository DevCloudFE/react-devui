import type { DGeneralStateContextData } from '../../hooks/general-state';
import type { Updater } from '../../hooks/two-way-binding';

import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, DGeneralStateContext } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';

export interface DRadioGroupContextData<T> {
  radioGroupName?: string;
  radioGroupValue: T;
  radioGroupType: DRadioGroupProps<T>['dType'];
  onCheckedChange: (value: T) => void;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DRadioGroupContext = React.createContext<DRadioGroupContextData<any> | null>(null);

export interface DRadioGroupProps<T = unknown> extends React.HTMLAttributes<HTMLDivElement> {
  dModel?: [T, Updater<T>?];
  dFormControlName?: string;
  dName?: string;
  dDisabled?: boolean;
  dType?: 'outline' | 'fill';
  dSize?: 'smaller' | 'larger';
  dVertical?: boolean;
  onModelChange?: (value: T) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DRadioGroup');
export function DRadioGroup<T>(props: DRadioGroupProps<T>) {
  const {
    dModel,
    dFormControlName,
    dName,
    dDisabled = false,
    dType,
    dSize,
    dVertical = false,
    onModelChange,
    className,
    children,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  const [value, changeValue, { ariaAttribute, controlDisabled }] = useTwoWayBinding<T>(
    null,
    dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName } : undefined
  );

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || controlDisabled;

  const generalStateContextValue = useMemo<DGeneralStateContextData>(
    () => ({
      gDisabled: disabled,
    }),
    [disabled]
  );

  const contextValue = useMemo<DRadioGroupContextData<T>>(
    () => ({
      radioGroupName: dName,
      radioGroupValue: value,
      radioGroupType: dType,
      onCheckedChange: (value) => {
        changeValue(value);
      },
    }),
    [changeValue, dName, dType, value]
  );

  return (
    <DGeneralStateContext.Provider value={generalStateContextValue}>
      <DRadioGroupContext.Provider value={contextValue}>
        <div
          {...restProps}
          {...ariaAttribute}
          className={getClassName(className, `${dPrefix}radio-group`, {
            [`${dPrefix}radio-group--${dType}`]: dType,
            [`${dPrefix}radio-group--${size}`]: size,
            [`${dPrefix}radio-group--vertical`]: dVertical,
          })}
          role="radiogroup"
        >
          {children}
        </div>
      </DRadioGroupContext.Provider>
    </DGeneralStateContext.Provider>
  );
}
