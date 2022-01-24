import type { DGeneralStateContextData } from '../../hooks/general-state';
import type { Updater } from '../../hooks/two-way-binding';
import type { DCheckboxProps } from './Checkbox';

import React, { useImperativeHandle, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, DGeneralStateContext, useImmer } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';

export interface DCheckboxGroupContextData<T> {
  updateCheckboxs: (identity: string, id: string, value: T) => void;
  removeCheckboxs: (identity: string) => void;
  checkboxGroupValue: T[];
  onCheckedChange: (value: T, checked: boolean) => void;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DCheckboxGroupContext = React.createContext<DCheckboxGroupContextData<any> | null>(null);

export interface DCheckboxGroupRef<T> {
  indeterminateProps: DCheckboxProps<T>;
  indeterminateChecked: 'mixed' | boolean;
}

export interface DCheckboxGroupProps<T = unknown> extends React.HTMLAttributes<HTMLDivElement> {
  dModel?: [T[], Updater<T[]>?];
  dFormControlName?: string;
  dDisabled?: boolean;
  dVertical?: boolean;
  onModelChange?: (values: T[]) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DCheckboxGroup');
function CheckboxGroup<T>(props: DCheckboxGroupProps<T>, ref: React.ForwardedRef<DCheckboxGroupRef<T>>) {
  const {
    dModel,
    dFormControlName,
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

  const [checkboxs, setCheckboxs] = useImmer(new Map<string, { id: string; value: T }>());

  const [value, changeValue, { ariaAttribute, controlDisabled }] = useTwoWayBinding<T[]>(
    [],
    dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName } : undefined
  );

  const disabled = dDisabled || gDisabled || controlDisabled;

  const generalStateContextValue = useMemo<DGeneralStateContextData>(
    () => ({
      gDisabled: disabled,
    }),
    [disabled]
  );

  const stateBackflow = useMemo<Pick<DCheckboxGroupContextData<T>, 'updateCheckboxs' | 'removeCheckboxs'>>(
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
  const contextValue = useMemo<DCheckboxGroupContextData<T>>(
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

  useImperativeHandle(
    ref,
    () => {
      const allLength = checkboxs.size;
      const checkedLength = value.length;
      const checked = checkedLength === 0 ? false : checkedLength === allLength ? true : ('mixed' as const);
      return {
        indeterminateProps: {
          dModel: checked !== 'mixed' ? [checked] : undefined,
          dIndeterminate: checked === 'mixed',
          dInputProps: {
            'aria-controls': Array.from(checkboxs.values())
              .map((item) => item.id)
              .join(' '),
          },
          onModelChange: () => {
            checked === true ? changeValue([]) : changeValue(Array.from(checkboxs.values()).map((item) => item.value));
          },
        } as DCheckboxProps<T>,
        indeterminateChecked: checked,
      };
    },
    [changeValue, checkboxs, value.length]
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

export const DCheckboxGroup = React.forwardRef(CheckboxGroup);
