import type { DId } from '../../utils/types';
import type { DFormControl } from '../form';

import { useId } from 'react';

import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { useFormControl } from '../form';
import { DCheckbox } from './Checkbox';

export interface DCheckboxList<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}
export interface DCheckboxGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dModel?: V[];
  dList: DCheckboxList<V>[];
  dDisabled?: boolean;
  dVertical?: boolean;
  onModelChange?: (values: V[]) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCheckbox.Group' as const });
export function DCheckboxGroup<V extends DId>(props: DCheckboxGroupProps<V>): JSX.Element | null {
  const {
    dFormControl,
    dList,
    dModel,
    dDisabled = false,
    dVertical = false,
    onModelChange,

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
      className={getClassName(restProps.className, `${dPrefix}checkbox-group`, {
        [`${dPrefix}checkbox-group--vertical`]: dVertical,
      })}
      role={restProps.role ?? 'group'}
    >
      {dList.map((item, index) => (
        <DCheckbox
          key={item.value}
          dDisabled={item.disabled || disabled}
          dInputProps={
            index === 0
              ? ({ id: getId(item.value), 'data-form-label-for': true } as React.InputHTMLAttributes<HTMLInputElement>)
              : undefined
          }
          dModel={value.includes(item.value)}
          onModelChange={(checked) => {
            changeValue((draft) => {
              if (checked) {
                draft.push(item.value);
              } else {
                draft.splice(
                  draft.findIndex((v) => v === item.value),
                  1
                );
              }
            });
          }}
        >
          {item.label}
        </DCheckbox>
      ))}
    </div>
  );
}
