import type { DFormControl } from '../form';

import { useState } from 'react';

import { usePrefixConfig, useComponentConfig, useWave, useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate, getClassName, checkNodeExist } from '../../utils';
import { DBaseDesign } from '../_base-design';
import { DBaseInput } from '../_base-input';
import { DFocusVisible } from '../_focus-visible';
import { useFormControl } from '../form';
import { DRadioGroup } from './RadioGroup';

export interface DRadioProps extends React.HTMLAttributes<HTMLElement> {
  dFormControl?: DFormControl;
  dModel?: boolean;
  dDisabled?: boolean;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

export interface DRadioPropsWithPrivate extends DRadioProps {
  __type?: 'outline' | 'fill';
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRadio' });
export const DRadio: {
  (props: DRadioProps): JSX.Element | null;
  Group: typeof DRadioGroup;
} = (props) => {
  const {
    children,
    dFormControl,
    dModel,
    dDisabled = false,
    dInputProps,
    dInputRef,
    onModelChange,
    __type,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DRadioPropsWithPrivate);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const [waveNode, wave] = useWave();

  const [focusVisible, setFocusVisible] = useState(false);

  const formControlInject = useFormControl(dFormControl);
  const [checked, changeChecked] = useDValue<boolean>(false, dModel, onModelChange, undefined, formControlInject);

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return (
    <DBaseDesign dCompose={{ active: checked || focusVisible, disabled: disabled }}>
      <label
        {...restProps}
        className={getClassName(restProps.className, `${dPrefix}radio`, {
          [`${dPrefix}radio--button`]: __type,
          [`${dPrefix}radio--button-${__type}`]: __type,
          [`${dPrefix}radio--${gSize}`]: gSize,
          'is-checked': checked,
          'is-focus-visible': focusVisible,
          'is-disabled': disabled,
        })}
        onClick={(e) => {
          restProps.onClick?.(e);

          if (__type === 'fill' || __type === 'outline') {
            wave(`var(--${dPrefix}color-primary)`);
          }
        }}
      >
        <div className={`${dPrefix}radio__input-wrapper`}>
          <DFocusVisible onFocusVisibleChange={setFocusVisible}>
            {({ fvOnFocus, fvOnBlur, fvOnKeyDown }) => (
              <DBaseInput
                {...dInputProps}
                ref={dInputRef}
                className={getClassName(dInputProps?.className, `${dPrefix}radio__input`)}
                type="radio"
                checked={checked}
                disabled={disabled}
                aria-checked={checked}
                onChange={(e) => {
                  dInputProps?.onChange?.(e);

                  changeChecked(true);
                }}
                onFocus={(e) => {
                  dInputProps?.onFocus?.(e);
                  fvOnFocus(e);
                }}
                onBlur={(e) => {
                  dInputProps?.onBlur?.(e);
                  fvOnBlur(e);
                }}
                onKeyDown={(e) => {
                  dInputProps?.onKeyDown?.(e);
                  fvOnKeyDown(e);
                }}
                dFormControl={dFormControl}
              />
            )}
          </DFocusVisible>
        </div>
        {checkNodeExist(children) && <div className={`${dPrefix}radio__label`}>{children}</div>}
        {waveNode}
      </label>
    </DBaseDesign>
  );
};

DRadio.Group = DRadioGroup;
