import type { DGeneralStateContextData } from '../../hooks/general-state';
import type { Updater } from '../../hooks/two-way-binding';

import React, { useCallback, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, DGeneralStateContext } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';

export interface DCheckboxGroupContextData<T> {
  gValue: T[];
  gOnCheckedChange: (value: T, checked: boolean) => void;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DCheckboxGroupContext = React.createContext<DCheckboxGroupContextData<any> | null>(null);

export interface DCheckboxGroupProps<T = unknown> extends React.HTMLAttributes<HTMLDivElement> {
  dFormControlName?: string;
  dModel?: [T[], Updater<T[]>?];
  dDisabled?: boolean;
  dVertical?: boolean;
  onModelChange?: (values: T[]) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DCheckboxGroup');
export function DCheckboxGroup<T>(props: DCheckboxGroupProps<T>) {
  const {
    dFormControlName,
    dModel,
    dDisabled = false,
    dVertical = false,
    onModelChange,
    className,
    children,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  //#endregion

  const [value, changeValue, { ariaAttribute, controlDisabled }] = useTwoWayBinding<T[]>([], dModel, onModelChange, {
    formControlName: dFormControlName,
  });

  const disabled = dDisabled || gDisabled || controlDisabled;

  const generalStateContextValue = useMemo<DGeneralStateContextData>(
    () => ({
      gDisabled: disabled,
    }),
    [disabled]
  );

  const gOnCheckedChange = useCallback(
    (value, checked) => {
      changeValue((draft) => {
        if (checked) {
          draft.push(value);
        } else {
          draft.splice(
            draft.findIndex((item) => item === value),
            1
          );
        }
      });
    },
    [changeValue]
  );
  const contextValue = useMemo<DCheckboxGroupContextData<T>>(
    () => ({
      gValue: value,
      gOnCheckedChange,
    }),
    [gOnCheckedChange, value]
  );

  return (
    <DGeneralStateContext.Provider value={generalStateContextValue}>
      <DCheckboxGroupContext.Provider value={contextValue}>
        <div
          {...restProps}
          {...ariaAttribute}
          className={getClassName(className, `${dPrefix}checkbox-group`, {
            [`${dPrefix}checkbox-group--vertical`]: dVertical,
          })}
          role="group"
        >
          {children}
        </div>
      </DCheckboxGroupContext.Provider>
    </DGeneralStateContext.Provider>
  );
}
