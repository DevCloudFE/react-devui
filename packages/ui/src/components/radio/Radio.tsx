import type { Updater } from '../../hooks/immer';
import type { DFormControl } from '../form';

import React, { useCallback } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext, useId, useTwoWayBinding, useWave, useRefCallback } from '../../hooks';
import { getClassName } from '../../utils';
import { DRadioGroupContext } from './RadioGroup';

export type DRadioRef = HTMLInputElement;

export type DValue = React.InputHTMLAttributes<HTMLInputElement>['value'];

export interface DRadioProps extends React.HTMLAttributes<HTMLElement>, DFormControl {
  dChecked?: [boolean, Updater<boolean>?];
  dDisabled?: boolean;
  dValue?: DValue;
  onCheckedChange?: (checked: boolean) => void;
}

export const DRadio = React.forwardRef<DRadioRef, DRadioProps>((props, ref) => {
  const {
    dFormControlName,
    dChecked,
    dDisabled = false,
    dValue,
    onCheckedChange,
    id,
    className,
    children,
    onChange,
    ...restProps
  } = useDComponentConfig(DRadio.name, props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const [{ radioGroupValue, radioGroupName, radioGroupType, radioGroupDisabled, onValueChange }, radioGroupContext] =
    useCustomContext(DRadioGroupContext);
  //#endregion

  //#region Ref
  const [radioEl, radioRef] = useRefCallback();
  //#endregion

  const wave = useWave();

  const _id = useId();
  const __id = id ?? `${dPrefix}radio-${_id}`;

  const inGroup = radioGroupContext !== null;

  const disabled = radioGroupDisabled || dDisabled;

  const [singleChecked, changeSingleChecked] = useTwoWayBinding(false, dChecked, onCheckedChange, {
    enable: !inGroup,
    name: dFormControlName,
  });

  const checked = inGroup ? radioGroupValue === dValue : singleChecked;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      onChange?.(e);

      if (!disabled) {
        changeSingleChecked(true);
        onValueChange?.(dValue);
        if (radioEl && (radioGroupType === 'fill' || radioGroupType === 'outline')) {
          wave.next([radioEl, `var(--${dPrefix}color-primary)`]);
        }
      }
    },
    [changeSingleChecked, dPrefix, dValue, disabled, onChange, onValueChange, radioEl, radioGroupType, wave]
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
          ref={ref}
          id={__id}
          className={`${dPrefix}radio__input`}
          checked={checked}
          type="radio"
          value={dValue}
          name={radioGroupName}
          disabled={disabled}
          aria-labelledby={`${dPrefix}radio-label-${_id}`}
          aria-checked={checked}
          onChange={handleChange}
        />
      </div>
      <label id={`${dPrefix}radio-label-${_id}`} className={`${dPrefix}radio__label`} htmlFor={__id}>
        {children}
      </label>
    </div>
  );
});
