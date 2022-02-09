import type { Updater } from '../../hooks/two-way-binding';

import React, { useCallback, useId } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useTwoWayBinding, useGeneralState } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DCheckboxGroupContext } from './CheckboxGroup';

export interface DCheckboxProps<T = unknown> extends React.HTMLAttributes<HTMLElement> {
  dFormControlName?: string;
  dModel?: [boolean, Updater<boolean>?];
  dIndeterminate?: boolean;
  dDisabled?: boolean;
  dValue?: T;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DCheckbox');
export function DCheckbox<T>(props: DCheckboxProps<T>) {
  const {
    dFormControlName,
    dModel,
    dIndeterminate = false,
    dDisabled = false,
    dValue,
    dInputProps,
    dInputRef,
    onModelChange,
    className,
    children,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  const [{ gValue, gOnCheckedChange }, checkboxGroupContext] = useCustomContext(DCheckboxGroupContext);
  //#endregion

  const uniqueId = useId();
  const _id = dInputProps?.id ?? `${dPrefix}checkbox-input-${uniqueId}`;

  const inGroup = checkboxGroupContext !== null;

  const [checked, changeChecked, { ariaAttribute, controlDisabled }] = useTwoWayBinding<boolean | undefined, boolean>(
    false,
    dModel ?? (dIndeterminate ? [undefined] : inGroup ? [gValue?.includes(dValue) ?? false] : undefined),
    onModelChange,
    { formControlName: dFormControlName, id: _id }
  );

  const disabled = dDisabled || gDisabled || controlDisabled;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(() => {
    changeChecked(dIndeterminate ? true : !checked);
    if (inGroup) {
      gOnCheckedChange?.(dValue, dIndeterminate ? true : !checked);
    }
  }, [changeChecked, dIndeterminate, checked, inGroup, gOnCheckedChange, dValue]);

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
