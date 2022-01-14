/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DGeneralStateContextData } from '../../hooks/general-state';
import type { Updater } from '../../hooks/two-way-binding';

import React, { useCallback, useLayoutEffect, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, DGeneralStateContext, useImmer } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DCheckbox } from './Checkbox';

export interface DCheckboxGroupContextData {
  updateCheckboxs: (identity: string, id: string, value: any) => void;
  removeCheckboxs: (identity: string) => void;
  checkboxGroupValue: any[];
  onCheckedChange: (value: any, checked: boolean) => void;
}
export const DCheckboxGroupContext = React.createContext<DCheckboxGroupContextData | null>(null);

export interface DCheckboxGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  dModel?: [any[], Updater<any[]>?];
  dFormControlName?: string;
  dDisabled?: boolean;
  dVertical?: boolean;
  dIndeterminateLabel?: (checked: boolean | 'mixed') => React.ReactNode;
  dIndeterminateRef?: (node: React.ReactNode) => void;
  onModelChange?: (values: any[]) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DCheckboxGroup');
export function DCheckboxGroup(props: DCheckboxGroupProps) {
  const {
    dModel,
    dFormControlName,
    dDisabled = false,
    dVertical = false,
    dIndeterminateLabel,
    dIndeterminateRef,
    onModelChange,
    className,
    children,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  //#endregion

  const [checkboxs, setCheckboxs] = useImmer(new Map<string, { id: string; value: any }>());

  const [value, changeValue, { ariaAttribute, controlDisabled }] = useTwoWayBinding(
    [],
    dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName } : undefined
  );

  const disabled = dDisabled || gDisabled || controlDisabled;

  const allLength = React.Children.count(children);
  const updateIndeterminate = useCallback(
    (value: any[]) => {
      const checkedLength = value.length;
      const checked = checkedLength === 0 ? false : checkedLength === allLength ? true : 'mixed';
      dIndeterminateRef?.(
        <DCheckbox
          dModel={checked !== 'mixed' ? [checked] : undefined}
          dIndeterminate={checked === 'mixed'}
          dInputProps={{
            'aria-controls': Array.from(checkboxs.values())
              .map((item) => item.id)
              .join(' '),
          }}
          onModelChange={() => {
            checked === true ? changeValue([]) : changeValue(Array.from(checkboxs.values()).map((item) => item.value));
          }}
        >
          {dIndeterminateLabel?.(checked)}
        </DCheckbox>
      );
    },
    [allLength, changeValue, checkboxs, dIndeterminateLabel, dIndeterminateRef]
  );

  useLayoutEffect(() => {
    updateIndeterminate(value);
  }, [updateIndeterminate, value]);

  const generalStateContextValue = useMemo<DGeneralStateContextData>(
    () => ({
      gDisabled: disabled,
    }),
    [disabled]
  );

  const stateBackflow = useMemo<Pick<DCheckboxGroupContextData, 'updateCheckboxs' | 'removeCheckboxs'>>(
    () => ({
      updateCheckboxs: (identity, id, value) => {
        setCheckboxs((draft) => {
          draft.set(identity, { id, value });
        });
      },
      removeCheckboxs: (identity) => {
        setCheckboxs((draft) => {
          draft.delete(identity);
        });
      },
    }),
    [setCheckboxs]
  );
  const contextValue = useMemo<DCheckboxGroupContextData>(
    () => ({
      ...stateBackflow,
      checkboxGroupValue: value,
      onCheckedChange: (value, checked) => {
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
    }),
    [changeValue, stateBackflow, value]
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
        >
          {children}
        </div>
      </DCheckboxGroupContext.Provider>
    </DGeneralStateContext.Provider>
  );
}
