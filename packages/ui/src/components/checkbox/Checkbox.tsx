import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DFormControl } from '../form';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralContext } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DBaseInput } from '../_base-input';

export interface DCheckboxProps extends React.HTMLAttributes<HTMLElement> {
  dFormControl?: DFormControl;
  dModel?: [boolean, DUpdater<boolean>?];
  dDisabled?: boolean;
  dIndeterminate?: boolean;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCheckbox' });
export function DCheckbox(props: DCheckboxProps): JSX.Element | null {
  const {
    children,
    dFormControl,
    dModel,
    dDisabled = false,
    dIndeterminate = false,
    dInputProps,
    dInputRef,
    onModelChange,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  const [checked, changeChecked] = useTwoWayBinding<boolean | undefined, boolean>(false, dIndeterminate ? [false] : dModel, onModelChange, {
    formControl: dFormControl?.control,
  });

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return (
    <label
      {...restProps}
      className={getClassName(className, `${dPrefix}checkbox`, {
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
          dFormControl={dFormControl}
          onChange={(e) => {
            dInputProps?.onChange?.(e);

            changeChecked(!checked);
          }}
        />
        {dIndeterminate ? (
          <div className={`${dPrefix}checkbox__indeterminate`}></div>
        ) : (
          checked && <div className={`${dPrefix}checkbox__tick`}></div>
        )}
      </div>
      {children && <div className={`${dPrefix}checkbox__label`}>{children}</div>}
    </label>
  );
}
