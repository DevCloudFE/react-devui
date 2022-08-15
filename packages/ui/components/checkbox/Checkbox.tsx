import type { DFormControl } from '../form';

import { checkNodeExist, getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DBaseInput } from '../_base-input';
import { useFormControl } from '../form';
import { DCheckboxGroup } from './CheckboxGroup';

export interface DCheckboxProps extends React.HTMLAttributes<HTMLElement> {
  dFormControl?: DFormControl;
  dModel?: boolean;
  dDisabled?: boolean;
  dIndeterminate?: boolean;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCheckbox' });
export const DCheckbox: {
  (props: DCheckboxProps): JSX.Element | null;
  Group: typeof DCheckboxGroup;
} = (props) => {
  const {
    children,
    dFormControl,
    dModel,
    dDisabled = false,
    dIndeterminate = false,
    dInputProps,
    dInputRef,
    onModelChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  const formControlInject = useFormControl(dFormControl);
  const [checked, changeChecked] = useDValue<boolean | undefined, boolean>(
    false,
    dIndeterminate ? false : dModel,
    onModelChange,
    undefined,
    formControlInject
  );

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return (
    <label
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}checkbox`, {
        'is-indeterminate': dIndeterminate,
        'is-checked': checked,
        'is-disabled': disabled,
      })}
    >
      <div className={`${dPrefix}checkbox__state-container`}>
        <DBaseInput
          {...dInputProps}
          ref={dInputRef}
          className={getClassName(dInputProps?.className, `${dPrefix}checkbox__input`)}
          type="checkbox"
          disabled={disabled}
          aria-checked={dIndeterminate ? 'mixed' : checked}
          onChange={(e) => {
            dInputProps?.onChange?.(e);

            changeChecked(!checked);
          }}
          dFormControl={dFormControl}
        />
        {dIndeterminate ? (
          <div className={`${dPrefix}checkbox__indeterminate`}></div>
        ) : (
          checked && <div className={`${dPrefix}checkbox__tick`}></div>
        )}
      </div>
      {checkNodeExist(children) && <div className={`${dPrefix}checkbox__label`}>{children}</div>}
    </label>
  );
};

DCheckbox.Group = DCheckboxGroup;
