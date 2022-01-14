import type { Updater } from '../../hooks/two-way-binding';

import React, { useCallback, useId, useState } from 'react';

import { DIcon } from '..';
import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, useRefCallback, useDTransition } from '../../hooks';
import { getClassName } from '../../utils';

export interface DSwitchProps extends React.HTMLAttributes<HTMLElement> {
  dModel?: [boolean, Updater<boolean>?];
  dFormControlName?: string;
  dLabelPlacement?: 'left' | 'right';
  dStateContent?: [React.ReactNode, React.ReactNode];
  dLoading?: boolean;
  dDisabled?: boolean;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.LegacyRef<HTMLInputElement>;
  onModelChange?: (checked: boolean) => void;
}

export function DSwitch(props: DSwitchProps) {
  const {
    dModel,
    dFormControlName,
    dLabelPlacement = 'right',
    dStateContent,
    dLoading = false,
    dDisabled = false,
    dInputProps,
    dInputRef,
    onModelChange,
    className,
    children,
    ...restProps
  } = useComponentConfig(DSwitch.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  //#endregion

  //#region Ref
  const [dotEl, dotRef] = useRefCallback();
  //#endregion

  const uniqueId = useId();
  const _id = dInputProps?.id ?? `${dPrefix}switch-input-${uniqueId}`;

  const [isFocus, setIsFocus] = useState(false);

  const [checked, changeChecked, { ariaAttribute, controlDisabled }] = useTwoWayBinding<boolean | undefined, boolean>(
    false,
    dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );

  const disabled = dDisabled || gDisabled || controlDisabled;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(() => {
    changeChecked(!checked);
  }, [changeChecked, checked]);

  const handleFocus = useCallback(
    (e) => {
      dInputProps?.onFocus?.(e);

      setIsFocus(true);
    },
    [dInputProps]
  );
  const handleBlur = useCallback(
    (e) => {
      dInputProps?.onBlur?.(e);

      setIsFocus(false);
    },
    [dInputProps]
  );

  const transitionState = {
    'enter-from': { left: '2px' },
    'enter-to': { left: 'calc(100% - 20px)', transition: 'width 133ms ease-in, left 133ms ease-out' },
    'leave-from': { right: '2px' },
    'leave-to': { right: 'calc(100% - 20px)', transition: 'width 133ms ease-in, right 133ms ease-out' },
  };
  const hidden = useDTransition({
    dEl: dotEl,
    dVisible: checked,
    dCallbackList: {
      beforeEnter: () => transitionState,
      beforeLeave: () => transitionState,
    },
  });

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
        <input
          {...dInputProps}
          {...ariaAttribute}
          ref={dInputRef}
          id={_id}
          className={getClassName(dInputProps?.className, `${dPrefix}switch__input`)}
          type="checkbox"
          role="switch"
          disabled={disabled || dLoading}
          aria-checked={checked}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <div
          ref={dotRef}
          className={getClassName(`${dPrefix}switch__state-dot`, {
            'is-focus': isFocus,
          })}
          style={{
            left: hidden ? 2 : undefined,
            right: !hidden ? 2 : undefined,
          }}
        >
          {dLoading && (
            <DIcon viewBox="0 0 1024 1024" dSpin>
              <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
            </DIcon>
          )}
        </div>
      </div>
      {children && <span className={`${dPrefix}switch__label`}>{children}</span>}
    </label>
  );
}
