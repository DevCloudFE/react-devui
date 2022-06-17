import type { DId } from '../../utils/global';
import type { DFormControl } from '../form';

import { useId } from 'react';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { useFormControl } from '../form';
import { DCheckbox } from './Checkbox';

export interface DCheckboxOption<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}
export interface DCheckboxGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dModel?: V[];
  dOptions: DCheckboxOption<V>[];
  dDisabled?: boolean;
  dVertical?: boolean;
  onModelChange?: (values: V[]) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCheckboxGroup' });
export function DCheckboxGroup<V extends DId>(props: DCheckboxGroupProps<V>) {
  const {
    dFormControl,
    dOptions,
    dModel,
    dDisabled = false,
    dVertical = false,
    onModelChange,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  const uniqueId = useId();
  const getId = (value: V) => `${dPrefix}checkbox-group-${value}-${uniqueId}`;

  const formControlInject = useFormControl(dFormControl);
  const [value, changeValue] = useDValue<V[]>([], dModel, onModelChange, undefined, formControlInject);

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}checkbox-group`, {
        [`${dPrefix}checkbox-group--vertical`]: dVertical,
      })}
      role="group"
    >
      {dOptions.map((option, index) => (
        <DCheckbox
          key={option.value}
          dDisabled={option.disabled || disabled}
          dInputProps={
            index === 0
              ? ({ id: getId(option.value), 'data-form-label-for': true } as React.InputHTMLAttributes<HTMLInputElement>)
              : undefined
          }
          dModel={value.includes(option.value)}
          onModelChange={(checked) => {
            changeValue((draft) => {
              if (checked) {
                draft.push(option.value);
              } else {
                draft.splice(
                  draft.findIndex((v) => v === option.value),
                  1
                );
              }
            });
          }}
        >
          {option.label}
        </DCheckbox>
      ))}
    </div>
  );
}
