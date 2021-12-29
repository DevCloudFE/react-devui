import type { Updater } from '../../hooks/two-way-binding';

import React, { useCallback, useId } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useTwoWayBinding, useGeneralState, useStateBackflow } from '../../hooks';
import { getClassName } from '../../utils';
import { DCheckboxGroupContext } from './CheckboxGroup';

export type DCheckboxRef = HTMLInputElement;

export interface DCheckboxProps extends React.HTMLAttributes<HTMLElement> {
  dModel?: [boolean, Updater<boolean>?];
  dFormControlName?: string;
  dIndeterminate?: boolean;
  dAriaControls?: string;
  dSize?: 'smaller' | 'larger';
  dDisabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dValue?: any;
  onModelChange?: (checked: boolean) => void;
}

const Checkbox: React.ForwardRefRenderFunction<DCheckboxRef, DCheckboxProps> = (props, ref) => {
  const {
    dModel,
    dFormControlName,
    dIndeterminate = false,
    dAriaControls,
    dSize,
    dDisabled = false,
    dValue,
    onModelChange,
    id,
    className,
    children,
    onChange,
    ...restProps
  } = useComponentConfig(DCheckbox.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  const [{ updateCheckboxs, removeCheckboxs, checkboxGroupValue, onCheckedChange }, checkboxGroupContext] =
    useCustomContext(DCheckboxGroupContext);
  //#endregion

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}checkbox-${uniqueId}`;

  useStateBackflow(updateCheckboxs, removeCheckboxs, _id, dValue);

  const inGroup = checkboxGroupContext !== null;

  const [checked, changeChecked, { validateClassName, ariaAttribute, controlDisabled }] = useTwoWayBinding(
    false,
    inGroup ? [checkboxGroupValue?.includes(dValue) ?? false] : dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || controlDisabled;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      onChange?.(e);

      if (!disabled) {
        if (inGroup) {
          onCheckedChange?.(dValue, !checked);
        } else {
          changeChecked(!checked);
        }
      }
    },
    [onChange, disabled, inGroup, onCheckedChange, dValue, checked, changeChecked]
  );

  return (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}checkbox`, {
        [`${dPrefix}checkbox--${size}`]: size,
        'is-indeterminate': dIndeterminate,
        'is-checked': !dIndeterminate && checked,
        'is-disabled': disabled,
      })}
    >
      <div className={`${dPrefix}checkbox__input-wrapper`}>
        <input
          {...ariaAttribute}
          ref={ref}
          id={_id}
          className={getClassName(`${dPrefix}checkbox__input`, validateClassName)}
          type="checkbox"
          disabled={disabled}
          aria-labelledby={`${dPrefix}checkbox-label-${uniqueId}`}
          aria-checked={dIndeterminate ? 'mixed' : checked}
          aria-controls={dAriaControls}
          onChange={handleChange}
        />
        {!dIndeterminate && checked && <div className={`${dPrefix}checkbox__tick`}></div>}
        {dIndeterminate && <div className={`${dPrefix}checkbox__indeterminate`}></div>}
      </div>
      <label id={`${dPrefix}checkbox-label-${uniqueId}`} className={`${dPrefix}checkbox__label`} htmlFor={_id}>
        {children}
      </label>
    </div>
  );
};

export const DCheckbox = React.forwardRef(Checkbox);
