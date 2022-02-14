import type { DUpdater } from '../../hooks/two-way-binding';

import React, { useId } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useWave, useGeneralState, useContextOptional } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DRadioGroupContext } from './RadioGroup';

export interface DRadioProps<T = unknown> extends React.HTMLAttributes<HTMLElement> {
  dFormControlName?: string;
  dModel?: [boolean, DUpdater<boolean>?];
  dDisabled?: boolean;
  dValue?: T;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DRadio');
export function DRadio<T>(props: DRadioProps<T>): JSX.Element | null {
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
  const { __context_exist, gName, gValue, gType, gOnCheckedChange } = useContextOptional(DRadioGroupContext);
  //#endregion

  const [waveNode, wave] = useWave();

  const uniqueId = useId();
  const _id = dInputProps?.id ?? `${dPrefix}radio-input-${uniqueId}`;

  const [checked, changeChecked, { ariaAttribute, controlDisabled }] = useTwoWayBinding<boolean>(
    false,
    dModel ?? (__context_exist ? [gValue === dValue] : undefined),
    onModelChange,
    { formControlName: dFormControlName, id: _id }
  );

  const disabled = dDisabled || gDisabled || controlDisabled;

  const handleClick: React.MouseEventHandler<HTMLLabelElement> = (e) => {
    onClick?.(e);

    if (!disabled && (gType === 'fill' || gType === 'outline')) {
      wave(`var(--${dPrefix}color-primary)`);
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    dInputProps?.onChange?.(e);

    changeChecked(true);
    if (__context_exist) {
      gOnCheckedChange?.(dValue);
    }
  };

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
          name={gName}
          checked={checked}
          disabled={disabled}
          aria-checked={checked}
          onChange={handleInputChange}
        />
      </div>
      {children && <span className={`${dPrefix}radio__label`}>{children}</span>}
      {waveNode}
    </label>
  );
}
