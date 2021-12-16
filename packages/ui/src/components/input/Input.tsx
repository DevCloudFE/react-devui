import type { Updater } from '../../hooks/two-way-binding';
import type { DFormControl } from '../form';

import { isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle } from 'react';
import { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useCustomContext, useRefCallback } from '../../hooks';
import { getClassName } from '../../utils';
import { useCompose } from '../compose';
import { DInputAffixContext } from './InputAffix';

export type DInputRef = HTMLInputElement;

export interface DInputProps extends React.InputHTMLAttributes<HTMLInputElement>, DFormControl {
  dValue?: [string, Updater<string>?];
  dSize?: 'smaller' | 'larger';
  onValueChange?: (value: string) => void;
}

const Input: React.ForwardRefRenderFunction<DInputRef, DInputProps> = (props, ref) => {
  const {
    dFormControlName,
    dValue,
    dSize,
    onValueChange,
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
  const [
    {
      inputAffixPassword,
      inputAffixNumber,
      inputAffixDisabled,
      inputAffixSize,
      onFocus: _onFocus,
      onBlur: _onBlur,
      onClearableChange,
      onInputRendered,
    },
  ] = useCustomContext(DInputAffixContext);
  const { composeSize, composeDisabled } = useCompose();
  //#endregion

  //#region Ref
  const [inputEl, inputRef] = useRefCallback<HTMLInputElement>();
  //#endregion

  const size = isUndefined(composeSize) ? inputAffixSize ?? dSize : composeSize;

  const [bindValue, changeBindValue] = useTwoWayBinding('', dValue, onValueChange, {
    name: dFormControlName,
  });

  const _disabled = composeDisabled || inputAffixDisabled || disabled;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      onChange?.(e);
      changeBindValue(e.currentTarget.value);
    },
    [changeBindValue, onChange]
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

  //#region DidUpdate
  useEffect(() => {
    if (inputEl) {
      onInputRendered?.(changeBindValue, inputEl);
    }
  }, [changeBindValue, inputEl, onInputRendered]);

  useEffect(() => {
    onClearableChange?.(bindValue.length > 0);
  }, [bindValue, onClearableChange]);
  //#endregion

  useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(ref, () => inputEl, [inputEl]);

  return (
    <input
      {...restProps}
      ref={inputRef}
      className={getClassName(className, `${dPrefix}input`, {
        [`${dPrefix}input--${size}`]: size,
      })}
      value={bindValue}
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
