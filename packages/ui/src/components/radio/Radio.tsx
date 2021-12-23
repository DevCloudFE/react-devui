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

export type DRadioRef = HTMLInputElement;

export type DValue = React.InputHTMLAttributes<HTMLInputElement>['value'];

export interface DRadioProps extends React.HTMLAttributes<HTMLElement> {
  dModel?: [boolean, Updater<boolean>?];
  dFormControlName?: string;
  dDisabled?: boolean;
  dValue?: DValue;
  onModelChange?: (checked: boolean) => void;
}

const Radio: React.ForwardRefRenderFunction<DRadioRef, DRadioProps> = (props, ref) => {
  const {
    dModel,
    dFormControlName,
    dDisabled = false,
    dValue,
    onModelChange,
    id,
    className,
    children,
    onChange,
    ...restProps
  } = useComponentConfig(DRadio.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  const [{ radioGroupValue, radioGroupName, radioGroupType, radioGroupDisabled, onCheckedChange }, radioGroupContext] =
    useCustomContext(DRadioGroupContext);
  //#endregion

  //#region Ref
  const [radioEl, radioRef] = useRefCallback();
  //#endregion

  const wave = useWave();

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}radio-${uniqueId}`;

  const inGroup = radioGroupContext !== null;

  const [checked, changeChecked, { validateClassName, ariaAttribute, controlDisabled }] = useTwoWayBinding(
    false,
    inGroup ? [radioGroupValue === dValue] : dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );

  const disabled = dDisabled || radioGroupDisabled || gDisabled || controlDisabled;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      onChange?.(e);

      if (!disabled) {
        if (inGroup) {
          onCheckedChange?.(dValue);
        } else {
          changeChecked(true);
        }
        if (radioEl && (radioGroupType === 'fill' || radioGroupType === 'outline')) {
          wave(radioEl, `var(--${dPrefix}color-primary)`);
        }
      }
    },
    [onChange, disabled, inGroup, radioEl, radioGroupType, onCheckedChange, dValue, changeChecked, wave, dPrefix]
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
          {...ariaAttribute}
          ref={ref}
          id={_id}
          className={getClassName(`${dPrefix}radio__input`, validateClassName)}
          checked={checked}
          type="radio"
          value={dValue}
          name={radioGroupName}
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
};

export const DRadio = React.forwardRef(Radio);
