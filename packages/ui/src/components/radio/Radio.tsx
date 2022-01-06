import type { Updater } from '../../hooks/two-way-binding';

import React, { useCallback, useId } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useCustomContext,
  useTwoWayBinding,
  useWave,
  useRefCallback,
  useGeneralState,
} from '../../hooks';
import { getClassName } from '../../utils';
import { DRadioGroupContext } from './RadioGroup';

export interface DRadioProps extends React.HTMLAttributes<HTMLElement> {
  dModel?: [boolean, Updater<boolean>?];
  dFormControlName?: string;
  dDisabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dValue?: any;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.LegacyRef<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

export function DRadio(props: DRadioProps) {
  const {
    dModel,
    dFormControlName,
    dDisabled = false,
    dValue,
    dInputProps,
    dInputRef,
    onModelChange,
    className,
    children,
    onChange,
    ...restProps
  } = useComponentConfig(DRadio.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  const [{ radioGroupValue, radioGroupName, radioGroupType, onCheckedChange }, radioGroupContext] = useCustomContext(DRadioGroupContext);
  //#endregion

  //#region Ref
  const [radioEl, radioRef] = useRefCallback();
  //#endregion

  const wave = useWave();

  const uniqueId = useId();
  const _id = dInputProps?.id ?? `${dPrefix}radio-input-${uniqueId}`;

  const inGroup = radioGroupContext !== null;

  const [checked, changeChecked, { ariaAttribute, controlDisabled }] = useTwoWayBinding(
    false,
    dModel ?? (inGroup ? [radioGroupValue === dValue] : undefined),
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );

  const disabled = dDisabled || gDisabled || controlDisabled;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      onChange?.(e);

      changeChecked(true);
      if (inGroup) {
        onCheckedChange?.(dValue);
      }
      if (radioEl && (radioGroupType === 'fill' || radioGroupType === 'outline')) {
        wave(radioEl, `var(--${dPrefix}color-primary)`);
      }
    },
    [onChange, inGroup, radioEl, radioGroupType, onCheckedChange, dValue, changeChecked, wave, dPrefix]
  );

  return (
    <div
      {...restProps}
      ref={radioRef}
      className={getClassName(className, `${dPrefix}radio`, {
        'is-checked': checked,
        'is-disabled': disabled,
      })}
    >
      <div className={`${dPrefix}radio__input-wrapper`}>
        <input
          {...dInputProps}
          {...ariaAttribute}
          ref={dInputRef}
          id={_id}
          className={getClassName(dInputProps?.className, `${dPrefix}radio__input`)}
          type="radio"
          name={radioGroupName}
          checked={checked}
          disabled={disabled}
          aria-labelledby={`${dPrefix}radio-label-${uniqueId}`}
          aria-checked={checked}
          onChange={handleChange}
        />
      </div>
      <label id={`${dPrefix}radio-label-${uniqueId}`} className={`${dPrefix}radio__label`} htmlFor={_id}>
        {children}
      </label>
    </div>
  );
}
