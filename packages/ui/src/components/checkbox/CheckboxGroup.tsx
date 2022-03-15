import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DId } from '../../types';
import type { DFormControl } from '../form';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DCheckbox } from './Checkbox';

export interface DCheckboxOption<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}
export interface DCheckboxGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  disabled?: boolean;
  dFormControl?: DFormControl;
  dOptions: DCheckboxOption<V>[];
  dModel?: [V[], DUpdater<V[]>?];
  dVertical?: boolean;
  onModelChange?: (values: V[]) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCheckboxGroup' });
export function DCheckboxGroup<V extends DId>(props: DCheckboxGroupProps<V>): JSX.Element | null {
  const {
    className,
    disabled: _disabled,
    dFormControl,
    dOptions,
    dModel,
    dVertical = false,
    onModelChange,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  //#endregion

  const [value, changeValue] = useTwoWayBinding<V[]>([], dModel, onModelChange, {
    formControl: dFormControl?.control,
  });

  const disabled = _disabled || gDisabled || dFormControl?.disabled;

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
          disabled={option.disabled || disabled}
          dInputProps={
            index === 0
              ? {
                  ...dFormControl?.inputAttrs,
                  id: dFormControl?.controlId,
                }
              : undefined
          }
          dModel={[value.includes(option.value)]}
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
