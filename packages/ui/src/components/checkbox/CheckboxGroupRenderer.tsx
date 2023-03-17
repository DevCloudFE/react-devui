import type { DId } from '../../utils/types';
import type { DFormControl } from '../form';

import { useGeneralContext, useDValue } from '../../hooks';
import { cloneHTMLElement, registerComponentMate } from '../../utils';
import { useFormControl } from '../form';
import { useComponentConfig } from '../root';
import { DCheckbox } from './Checkbox';

export interface DCheckboxItem<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}
export interface DCheckboxGroupRendererProps<V extends DId> {
  dFormControl?: DFormControl;
  dModel?: V[];
  dList: DCheckboxItem<V>[];
  dDisabled?: boolean;
  dRender: (nodes: React.ReactElement[]) => JSX.Element | null;
  onModelChange?: (values: V[]) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCheckbox.GroupRenderer' as const });
export function DCheckboxGroupRenderer<V extends DId>(props: DCheckboxGroupRendererProps<V>): JSX.Element | null {
  const { dFormControl, dList, dModel, dDisabled = false, dRender, onModelChange } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const { gDisabled } = useGeneralContext();
  //#endregion

  const formControlInject = useFormControl(dFormControl);
  const [value, changeValue] = useDValue<V[]>([], dModel, onModelChange, undefined, formControlInject);

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return dRender(
    dList.map((item, index) => (
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
    ))
  );
}
