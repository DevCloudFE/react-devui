import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DFormControl } from '../form';

import { useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useWave, useGeneralContext } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DBaseInput } from '../_base-input';
import { DBaseSupport } from '../_base-support';
import { DFocusVisible } from '../_focus-visible';

export interface DRadioProps extends React.HTMLAttributes<HTMLElement> {
  dFormControl?: DFormControl;
  dModel?: [boolean, DUpdater<boolean>?];
  dDisabled?: boolean;
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
    children,
    dFormControl,
    dModel,
    dDisabled = false,
    dInputProps,
    dInputRef,
    onModelChange,
    __type,

    className,
    onClick,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DRadioPropsWithPrivate);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const [waveNode, wave] = useWave();

  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const [checked, changeChecked] = useTwoWayBinding<boolean>(false, dModel, onModelChange, {
    formControl: dFormControl?.control,
  });

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return (
    <DBaseSupport dCompose={{ active: checked || isFocusVisible, disabled: disabled }}>
      <label
        {...restProps}
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
          <DFocusVisible onFocusVisibleChange={setIsFocusVisible}>
            <DBaseInput
              {...dInputProps}
              ref={dInputRef}
              className={getClassName(dInputProps?.className, `${dPrefix}radio__input`)}
              type="radio"
              checked={checked}
              disabled={disabled}
              aria-checked={checked}
              dFormControl={dFormControl}
              onChange={(e) => {
                dInputProps?.onChange?.(e);

                changeChecked(true);
              }}
            />
          </DFocusVisible>
        </div>
        {children && <div className={`${dPrefix}radio__label`}>{children}</div>}
        {waveNode}
      </label>
    </DBaseSupport>
  );
}
