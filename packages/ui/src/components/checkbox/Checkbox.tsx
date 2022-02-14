import type { DUpdater } from '../../hooks/two-way-binding';

import React, { useId } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, useContextOptional } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DCheckboxGroupContext } from './CheckboxGroup';

export interface DCheckboxProps<T = unknown> extends React.HTMLAttributes<HTMLElement> {
  dFormControlName?: string;
  dModel?: [boolean, DUpdater<boolean>?];
  dIndeterminate?: boolean;
  dDisabled?: boolean;
  dValue?: T;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DCheckbox');
export function DCheckbox<T>(props: DCheckboxProps<T>): JSX.Element | null {
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
  const { __context_exist, gValue, gOnCheckedChange } = useContextOptional(DCheckboxGroupContext);
  //#endregion

  const uniqueId = useId();
  const _id = dInputProps?.id ?? `${dPrefix}checkbox-input-${uniqueId}`;

  const [checked, changeChecked, { ariaAttribute, controlDisabled }] = useTwoWayBinding<boolean | undefined, boolean>(
    false,
    dModel ?? (dIndeterminate ? [undefined] : __context_exist ? [gValue?.includes(dValue) ?? false] : undefined),
    onModelChange,
    { formControlName: dFormControlName, id: _id }
  );

  const disabled = dDisabled || gDisabled || controlDisabled;

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    dInputProps?.onChange?.(e);

    changeChecked(dIndeterminate ? true : !checked);
    if (__context_exist) {
      gOnCheckedChange?.(dValue, dIndeterminate ? true : !checked);
    }
  };

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
          onChange={handleInputChange}
        />
        {!dIndeterminate && checked && <div className={`${dPrefix}checkbox__tick`}></div>}
        {dIndeterminate && <div className={`${dPrefix}checkbox__indeterminate`}></div>}
      </div>
      {children && <span className={`${dPrefix}checkbox__label`}>{children}</span>}
    </label>
  );
}
