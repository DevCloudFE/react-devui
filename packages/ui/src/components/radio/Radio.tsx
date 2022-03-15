import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DFormControl } from '../form';

import { useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useWave, useGeneralState, useFocusVisible } from '../../hooks';
import { registerComponentMate, getClassName, mergeAriaDescribedby } from '../../utils';
import { useCompose } from '../compose';

export interface DRadioProps extends React.HTMLAttributes<HTMLElement> {
  disabled?: boolean;
  dFormControl?: DFormControl;
  dModel?: [boolean, DUpdater<boolean>?];
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

export interface DRadioPropsWithPrivate extends DRadioProps {
  __type?: 'outline' | 'fill';
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRadio' });
export function DRadio(props: DRadioProps): JSX.Element | null {
  const {
    className,
    disabled: _disabled,
    children,
    dFormControl,
    dModel,
    dInputProps,
    dInputRef,
    onModelChange,
    onClick,
    __type,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DRadioPropsWithPrivate);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  const [waveNode, wave] = useWave();

  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const { fvOnFocus, fvOnBlur, fvOnKeyDown } = useFocusVisible(setIsFocusVisible);

  const [checked, changeChecked] = useTwoWayBinding<boolean>(false, dModel, onModelChange, {
    formControl: dFormControl?.control,
  });

  const disabled = _disabled || gDisabled || dFormControl?.disabled;

  const composeDataAttrs = useCompose(checked || isFocusVisible, disabled);

  return (
    <label
      {...restProps}
      {...composeDataAttrs}
      className={getClassName(className, `${dPrefix}radio`, {
        [`${dPrefix}radio--button`]: __type,
        [`${dPrefix}radio--button-${__type}`]: __type,
        [`${dPrefix}radio--${gSize}`]: gSize,
        'is-checked': checked,
        'is-focus-visible': isFocusVisible,
        'is-disabled': disabled,
      })}
      onClick={(e) => {
        onClick?.(e);

        if (__type === 'fill' || __type === 'outline') {
          wave(`var(--${dPrefix}color-primary)`);
        }
      }}
    >
      <div className={`${dPrefix}radio__input-wrapper`}>
        <input
          {...dInputProps}
          {...dFormControl?.inputAttrs}
          id={dInputProps?.id ?? dFormControl?.controlId}
          ref={dInputRef}
          className={getClassName(dInputProps?.className, `${dPrefix}radio__input`)}
          type="radio"
          checked={checked}
          disabled={disabled}
          aria-checked={checked}
          aria-describedby={mergeAriaDescribedby(dInputProps?.['aria-describedby'], dFormControl?.inputAttrs?.['aria-describedby'])}
          onChange={(e) => {
            dInputProps?.onChange?.(e);

            changeChecked(true);
          }}
          onFocus={(e) => {
            dInputProps?.onFocus?.(e);
            fvOnFocus();
          }}
          onBlur={(e) => {
            dInputProps?.onBlur?.(e);
            fvOnBlur();
          }}
          onKeyDown={(e) => {
            dInputProps?.onKeyDown?.(e);
            fvOnKeyDown(e);
          }}
        />
      </div>
      {children && <div className={`${dPrefix}radio__label`}>{children}</div>}
      {waveNode}
    </label>
  );
}
