import type { DId } from '../../utils/types';
import type { DFormControl } from '../form';

import { getClassName } from '@react-devui/utils';

import { useGeneralContext, useDValue } from '../../hooks';
import { cloneHTMLElement, registerComponentMate } from '../../utils';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DCheckbox } from './Checkbox';

export interface DCheckboxItem<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}
export interface DCheckboxGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dModel?: V[];
  dList: DCheckboxItem<V>[];
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

  const formControlInject = useFormControl(dFormControl);
  const [value, changeValue] = useDValue<V[]>([], dModel, onModelChange, undefined, formControlInject);

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}checkbox-group`, {
        [`${dPrefix}checkbox-group--vertical`]: dVertical,
      })}
      role="group"
    >
      {dList.map((item, index) => (
        <DCheckbox
          key={item.value}
          dDisabled={item.disabled || disabled}
          dInputRender={(el) =>
            cloneHTMLElement(el, {
              ['data-form-item-label-for' as string]: index === 0,
            })
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
