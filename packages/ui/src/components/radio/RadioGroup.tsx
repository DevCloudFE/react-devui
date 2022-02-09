import type { DGeneralStateContextData } from '../../hooks/general-state';
import type { Updater } from '../../hooks/two-way-binding';

import React, { useCallback, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, DGeneralStateContext } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';

export interface DRadioGroupContextData<T> {
  gName?: string;
  gValue: T;
  gType: DRadioGroupProps<T>['dType'];
  gOnCheckedChange: (value: T) => void;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DRadioGroupContext = React.createContext<DRadioGroupContextData<any> | null>(null);

export interface DRadioGroupProps<T = unknown> extends React.HTMLAttributes<HTMLDivElement> {
  dFormControlName?: string;
  dModel?: [T, Updater<T>?];
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
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  const [value, changeValue, { ariaAttribute, controlDisabled }] = useTwoWayBinding<T>(null, dModel, onModelChange, {
    formControlName: dFormControlName,
  });

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || controlDisabled;

  const generalStateContextValue = useMemo<DGeneralStateContextData>(
    () => ({
      gDisabled: disabled,
    }),
    [disabled]
  );

  const gOnCheckedChange = useCallback(
    (value) => {
      changeValue(value);
    },
    [changeValue]
  );
  const contextValue = useMemo<DRadioGroupContextData<T>>(
    () => ({
      gName: dName,
      gValue: value,
      gType: dType,
      gOnCheckedChange,
    }),
    [dName, dType, gOnCheckedChange, value]
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
