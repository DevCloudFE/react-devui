import type { Updater } from '../../hooks/two-way-binding';

import React, { useCallback, useId } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useTwoWayBinding, useGeneralState, useStateBackflow } from '../../hooks';
import { getClassName } from '../../utils';
import { DCheckboxGroupContext } from './CheckboxGroup';

export interface DCheckboxProps extends React.HTMLAttributes<HTMLElement> {
  dModel?: [boolean, Updater<boolean>?];
  dFormControlName?: string;
  dIndeterminate?: boolean;
  dDisabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dValue?: any;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.LegacyRef<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

export function DCheckbox(props: DCheckboxProps) {
  const {
    dModel,
    dFormControlName,
    dIndeterminate = false,
    dDisabled = false,
    dValue,
    dInputProps,
    dInputRef,
    onModelChange,
    className,
    children,
    ...restProps
  } = useComponentConfig(DCheckbox.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  const [{ updateCheckboxs, removeCheckboxs, checkboxGroupValue, onCheckedChange }, checkboxGroupContext] =
    useCustomContext(DCheckboxGroupContext);
  //#endregion

  const uniqueId = useId();
  const _id = dInputProps?.id ?? `${dPrefix}checkbox-input-${uniqueId}`;

  useStateBackflow(updateCheckboxs, removeCheckboxs, _id, dValue);

  const inGroup = checkboxGroupContext !== null;

  const [checked, changeChecked, { ariaAttribute, controlDisabled }] = useTwoWayBinding<boolean | undefined, boolean>(
    false,
    dModel ?? (dIndeterminate ? [undefined] : inGroup ? [checkboxGroupValue?.includes(dValue) ?? false] : undefined),
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );

  const disabled = dDisabled || gDisabled || controlDisabled;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(() => {
    changeChecked(dIndeterminate ? true : !checked);
    if (inGroup) {
      onCheckedChange?.(dValue, dIndeterminate ? true : !checked);
    }
  }, [changeChecked, dIndeterminate, checked, inGroup, onCheckedChange, dValue]);

  return (
    <label
      {...restProps}
      className={getClassName(className, `${dPrefix}checkbox`, {
        'is-indeterminate': dIndeterminate,
        'is-checked': !dIndeterminate && checked,
        'is-disabled': disabled,
      })}
    >
      <div className={`${dPrefix}checkbox__state-container`}>
        <input
          {...dInputProps}
          {...ariaAttribute}
          ref={dInputRef}
          id={_id}
          className={getClassName(dInputProps?.className, `${dPrefix}checkbox__input`)}
          type="checkbox"
          disabled={disabled}
          aria-checked={dIndeterminate ? 'mixed' : checked}
          onChange={handleChange}
        />
        {!dIndeterminate && checked && <div className={`${dPrefix}checkbox__tick`}></div>}
        {dIndeterminate && <div className={`${dPrefix}checkbox__indeterminate`}></div>}
      </div>
      {children && <span className={`${dPrefix}checkbox__label`}>{children}</span>}
    </label>
  );
}
