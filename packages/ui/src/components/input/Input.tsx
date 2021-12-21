import type { Updater } from '../../hooks/two-way-binding';

import React, { useEffect, useId, useImperativeHandle } from 'react';
import { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useCustomContext, useRefCallback, useGeneralState } from '../../hooks';
import { getClassName } from '../../utils';
import { DInputAffixContext } from './InputAffix';

export type DInputRef = HTMLInputElement;

export interface DInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  dModel?: [string, Updater<string>?];
  dFormControlName?: string;
  dSize?: 'smaller' | 'larger';
  onModelChange?: (value: string) => void;
}

const Input: React.ForwardRefRenderFunction<DInputRef, DInputProps> = (props, ref) => {
  const {
    dModel,
    dFormControlName,
    dSize,
    onModelChange,
    id,
    className,
    type = 'text',
    disabled,
    onClick,
    onFocus,
    onBlur,
    onChange,
    ...restProps
  } = useComponentConfig(DInput.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  const [
    {
      inputAffixPassword,
      inputAffixNumber,
      inputAffixDisabled,
      inputAffixSetInputEl,
      inputAffixSetClearable,
      inputAffixSetValidateClassName,
      inputAffixNotificationCallback,
      onFocus: _onFocus,
      onBlur: _onBlur,
    },
  ] = useCustomContext(DInputAffixContext);
  //#endregion

  //#region Ref
  const [inputEl, inputRef] = useRefCallback<HTMLInputElement>();
  //#endregion

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}input-${uniqueId}`;

  const size = dSize ?? gSize;

  const [value, changeValue, { validateClassName, ariaAttribute, controlDisabled }] = useTwoWayBinding(
    '',
    dModel,
    onModelChange,
    /* istanbul ignore next */
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );

  const _disabled = disabled || inputAffixDisabled || gDisabled || controlDisabled;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      onChange?.(e);
      changeValue(e.currentTarget.value);
    },
    [changeValue, onChange]
  );

  const handleFocus = useCallback<React.FocusEventHandler<HTMLInputElement>>(
    (e) => {
      onFocus?.(e);
      _onFocus?.();
    },
    [_onFocus, onFocus]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);
      _onBlur?.();
    },
    [_onBlur, onBlur]
  );

  useEffect(() => {
    inputAffixNotificationCallback?.bind(changeValue);
    return () => {
      inputAffixNotificationCallback?.removeBind(changeValue);
    };
  }, [changeValue, inputAffixNotificationCallback]);

  useEffect(() => {
    inputAffixSetInputEl?.(inputEl);
  }, [inputAffixSetInputEl, inputEl]);

  useEffect(() => {
    inputAffixSetClearable?.(value.length > 0);
  }, [inputAffixSetClearable, value.length]);

  useEffect(() => {
    inputAffixSetValidateClassName?.(validateClassName);
  }, [inputAffixSetValidateClassName, validateClassName]);

  useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(ref, () => inputEl, [inputEl]);

  return (
    <input
      {...restProps}
      {...ariaAttribute}
      ref={inputRef}
      id={_id}
      className={getClassName(className, `${dPrefix}input`, validateClassName, {
        [`${dPrefix}input--${size}`]: size,
      })}
      value={value}
      type={inputAffixNumber ? 'number' : inputAffixPassword ? 'password' : type}
      disabled={_disabled}
      aria-disabled={_disabled}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

export const DInput = React.forwardRef(Input);
