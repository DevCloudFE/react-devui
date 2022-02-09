import type { Updater } from '../../hooks/two-way-binding';

import React, { useId, useImperativeHandle } from 'react';
import { useCallback } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useTwoWayBinding,
  useCustomContext,
  useRefCallback,
  useGeneralState,
  useIsomorphicLayoutEffect,
} from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DInputAffixContext } from './InputAffix';

export type DInputRef = HTMLInputElement;

export interface DInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  dFormControlName?: string;
  dModel?: [string, Updater<string>?];
  dSize?: 'smaller' | 'larger';
  onModelChange?: (value: string) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DInput');
const Input: React.ForwardRefRenderFunction<DInputRef, DInputProps> = (props, ref) => {
  const {
    dFormControlName,
    dModel,
    dSize,
    onModelChange,
    id,
    className,
    type = 'text',
    disabled,
    onFocus,
    onBlur,
    onChange,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  const [{ gUpdateInput, gPassword, gNumber, gOnFocus, gOnBlur }] = useCustomContext(DInputAffixContext);
  //#endregion

  //#region Ref
  const [inputEl, inputRef] = useRefCallback<HTMLInputElement>();
  //#endregion

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}input-${uniqueId}`;

  const size = dSize ?? gSize;

  const [value, changeValue, { validateClassName, ariaAttribute, controlDisabled }] = useTwoWayBinding<string>('', dModel, onModelChange, {
    formControlName: dFormControlName,
    id: _id,
  });

  useIsomorphicLayoutEffect(() => {
    gUpdateInput?.({
      value,
      max: props.max,
      min: props.min,
      step: props.step,
      validateClassName,
      setValue: (value) => {
        changeValue(value);
      },
    });
  }, [changeValue, gUpdateInput, props.max, props.min, props.step, validateClassName, value]);

  const _disabled = disabled || gDisabled || controlDisabled;

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

      gOnFocus?.();
    },
    [gOnFocus, onFocus]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);

      gOnBlur?.();
    },
    [gOnBlur, onBlur]
  );

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
      type={gNumber ? 'number' : gPassword ? 'password' : type}
      disabled={_disabled}
      aria-disabled={_disabled}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

export const DInput = React.forwardRef(Input);
