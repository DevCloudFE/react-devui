import type { Updater } from '../../hooks/two-way-binding';
import type { DFormControl } from '../form';

import React, { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useId, useTwoWayBinding, useWave, useRefCallback } from '../../hooks';
import { getClassName } from '../../utils';
import { DRadioGroupContext } from './RadioGroup';

export type DRadioRef = HTMLInputElement;

export type DValue = React.InputHTMLAttributes<HTMLInputElement>['value'];

export interface DRadioProps extends React.HTMLAttributes<HTMLElement>, DFormControl {
  dModel?: [boolean, Updater<boolean>?];
  dDisabled?: boolean;
  dValue?: DValue;
  onModelChange?: (checked: boolean) => void;
}

const Radio: React.ForwardRefRenderFunction<DRadioRef, DRadioProps> = (props, ref) => {
  const {
    dFormControlName,
    dModel,
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
  const [{ radioGroupValue, radioGroupName, radioGroupType, radioGroupDisabled, onModelChange: _onModelChange }, radioGroupContext] =
    useCustomContext(DRadioGroupContext);
  //#endregion

  //#region Ref
  const [radioEl, radioRef] = useRefCallback();
  //#endregion

  const wave = useWave();

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}radio-${uniqueId}`;

  const inGroup = radioGroupContext !== null;

  const disabled = radioGroupDisabled || dDisabled;

  const [checked, changeChecked] = useTwoWayBinding(false, dModel, onModelChange, {
    enable: !inGroup,
    name: dFormControlName,
  });
  const _checked = inGroup ? radioGroupValue === dValue : checked;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      onChange?.(e);

      if (!disabled) {
        changeChecked(true);
        _onModelChange?.(dValue);
        if (radioEl && (radioGroupType === 'fill' || radioGroupType === 'outline')) {
          wave(radioEl, `var(--${dPrefix}color-primary)`);
        }
      }
    },
    [onChange, disabled, changeChecked, _onModelChange, dValue, radioEl, radioGroupType, wave, dPrefix]
  );

  return (
    <div
      {...restProps}
      ref={radioRef}
      className={getClassName(className, `${dPrefix}radio`, {
        'is-checked': _checked,
        'is-disabled': disabled,
      })}
    >
      <div className={`${dPrefix}radio__input-wrapper`}>
        <input
          ref={ref}
          id={_id}
          className={`${dPrefix}radio__input`}
          checked={_checked}
          type="radio"
          value={dValue}
          name={radioGroupName}
          disabled={disabled}
          aria-labelledby={`${dPrefix}radio-label-${uniqueId}`}
          aria-checked={_checked}
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
