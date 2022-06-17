import type { DTransitionState } from '../_transition';
import type { DFormControl } from '../form';

import { useState } from 'react';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue } from '../../hooks';
import { LoadingOutlined } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { DBaseInput } from '../_base-input';
import { DTransition } from '../_transition';
import { useFormControl } from '../form';

export interface DSwitchProps extends React.HTMLAttributes<HTMLElement> {
  dFormControl?: DFormControl;
  dModel?: boolean;
  dLabelPlacement?: 'left' | 'right';
  dStateContent?: [React.ReactNode, React.ReactNode];
  dDisabled?: boolean;
  dLoading?: boolean;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

const TTANSITION_DURING = 133;
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSwitch' });
export function DSwitch(props: DSwitchProps) {
  const {
    children,
    dFormControl,
    dModel,
    dLabelPlacement = 'right',
    dStateContent,
    dLoading = false,
    dDisabled = false,
    dInputProps,
    dInputRef,
    onModelChange,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  const [isFocus, setIsFocus] = useState(false);

  const formControlInject = useFormControl(dFormControl);
  const [checked, changeChecked] = useDValue<boolean, boolean>(false, dModel, onModelChange, undefined, formControlInject);

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const transitionStyles: Partial<Record<DTransitionState, React.CSSProperties>> = {
    enter: { left: 2 },
    entering: { left: 'calc(100% - 20px)', transition: `width ${TTANSITION_DURING}ms ease-in, left ${TTANSITION_DURING}ms ease-out` },
    entered: { right: 2 },
    leave: { right: 2 },
    leaving: { right: 'calc(100% - 20px)', transition: `width ${TTANSITION_DURING}ms ease-in, right ${TTANSITION_DURING}ms ease-out` },
    leaved: { left: 2 },
  };

  return (
    <label
      {...restProps}
      className={getClassName(className, `${dPrefix}switch`, {
        [`${dPrefix}switch--label-left`]: dLabelPlacement === 'left',
        'is-checked': checked,
        'is-disabled': disabled,
        'is-loading': dLoading,
      })}
    >
      <div className={`${dPrefix}switch__state-container`}>
        {dStateContent && (
          <div className={`${dPrefix}switch__state-content`} style={{ opacity: checked ? 1 : 0 }}>
            {dStateContent[0]}
          </div>
        )}
        {dStateContent && (
          <div className={`${dPrefix}switch__state-content`} style={{ opacity: checked ? 0 : 1 }}>
            {dStateContent[1]}
          </div>
        )}
        <DBaseInput
          {...dInputProps}
          ref={dInputRef}
          className={getClassName(dInputProps?.className, `${dPrefix}switch__input`)}
          type="checkbox"
          disabled={disabled || dLoading}
          role="switch"
          aria-checked={checked}
          dFormControl={dFormControl}
          onChange={(e) => {
            dInputProps?.onChange?.(e);

            changeChecked(!checked);
          }}
          onFocus={(e) => {
            dInputProps?.onFocus?.(e);

            setIsFocus(true);
          }}
          onBlur={(e) => {
            dInputProps?.onBlur?.(e);

            setIsFocus(false);
          }}
        />
        <DTransition dIn={checked} dDuring={TTANSITION_DURING}>
          {(state) => (
            <div
              className={getClassName(`${dPrefix}switch__state-dot`, {
                'is-focus': isFocus,
              })}
              style={transitionStyles[state]}
            >
              {dLoading && <LoadingOutlined dSpin />}
            </div>
          )}
        </DTransition>
      </div>
      {children && <div className={`${dPrefix}switch__label`}>{children}</div>}
    </label>
  );
}
