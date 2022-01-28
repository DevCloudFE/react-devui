import type { Updater } from '../../hooks/two-way-binding';

import React, { useCallback, useId } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useTwoWayBinding, useWave, useGeneralState } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DRadioGroupContext } from './RadioGroup';

export interface DRadioProps<T = unknown> extends React.HTMLAttributes<HTMLElement> {
  dFormControlName?: string;
  dModel?: [boolean, Updater<boolean>?];
  dDisabled?: boolean;
  dValue?: T;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DRadio');
export function DRadio<T>(props: DRadioProps<T>) {
  const {
    dFormControlName,
    dModel,
    dDisabled = false,
    dValue,
    dInputProps,
    dInputRef,
    onModelChange,
    className,
    children,
    onClick,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  const [{ radioGroupValue, radioGroupName, radioGroupType, onCheckedChange }, radioGroupContext] = useCustomContext(DRadioGroupContext);
  //#endregion

  const [waveNode, wave] = useWave();

  const uniqueId = useId();
  const _id = dInputProps?.id ?? `${dPrefix}radio-input-${uniqueId}`;

  const inGroup = radioGroupContext !== null;

  const [checked, changeChecked, { ariaAttribute, controlDisabled }] = useTwoWayBinding<boolean>(
    false,
    dModel ?? (inGroup ? [radioGroupValue === dValue] : undefined),
    onModelChange,
    { formControlName: dFormControlName, id: _id }
  );

  const disabled = dDisabled || gDisabled || controlDisabled;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(() => {
    changeChecked(true);
    if (inGroup) {
      onCheckedChange?.(dValue);
    }
  }, [inGroup, onCheckedChange, dValue, changeChecked]);

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      if (!disabled && (radioGroupType === 'fill' || radioGroupType === 'outline')) {
        wave(`var(--${dPrefix}color-primary)`);
      }
    },
    [dPrefix, disabled, onClick, radioGroupType, wave]
  );

  return (
    <label
      {...restProps}
      className={getClassName(className, `${dPrefix}radio`, {
        'is-checked': checked,
        'is-disabled': disabled,
      })}
      onClick={handleClick}
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
          aria-checked={checked}
          onChange={handleChange}
        />
      </div>
      {children && <span className={`${dPrefix}radio__label`}>{children}</span>}
      {waveNode}
    </label>
  );
}
