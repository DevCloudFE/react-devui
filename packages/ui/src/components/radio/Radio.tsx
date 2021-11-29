import type { Updater } from '../../hooks/immer';
import type { DFormControl } from '../form';

import { isUndefined } from 'lodash';
import React, { useCallback } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext, useId, useTwoWayBinding } from '../../hooks';
import { getClassName } from '../../utils';
import { DButton } from '../button';
import { DRadioGroupContext } from './RadioGroup';

export type DRadioRef = HTMLInputElement;

export type DValue = React.InputHTMLAttributes<HTMLInputElement>['value'];

export interface DRadioProps extends React.HTMLAttributes<HTMLElement>, DFormControl {
  dChecked?: [boolean, Updater<boolean>?];
  dDisabled?: boolean;
  dValue?: DValue;
  onCheckedChange?: (checked: boolean) => void;
}

export function DRadio(props: DRadioProps) {
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
  } = useDComponentConfig('button', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const [{ radioGroupValue, radioGroupName, radioGroupType, radioGroupDisabled, onValueChange }, radioGroupContext] =
    useCustomContext(DRadioGroupContext);
  //#endregion

  const inGroup = radioGroupContext !== null;

  const _id = useId();
  const __id = id ?? `${dPrefix}radio-${_id}`;

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
      }
    },
    [changeSingleChecked, dValue, disabled, onChange, onValueChange]
  );

  const node = (
    <>
      <div className={`${dPrefix}radio__input-wrapper`}>
        <input
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
    </>
  );

  return isUndefined(radioGroupType) ? (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}radio`, {
        'is-checked': checked,
        'is-disabled': disabled,
      })}
    >
      {node}
    </div>
  ) : (
    <DButton
      {...restProps}
      className={getClassName(className, `${dPrefix}radio`, {
        'is-checked': checked,
      })}
      disabled={disabled}
      dType={checked ? (radioGroupType === 'fill' ? 'primary' : 'outline') : 'secondary'}
    >
      {node}
    </DButton>
  );
}
