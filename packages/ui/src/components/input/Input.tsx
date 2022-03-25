import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DSize } from '../../types';
import type { DFormControl } from '../form';

import { isNumber } from 'lodash';
import { useRef, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useTranslation,
  useAsync,
  useGeneralState,
  useTwoWayBinding,
  useForkRef,
  useEventCallback,
} from '../../hooks';
import { CloseCircleFilled, DCustomIcon, EyeInvisibleOutlined, EyeOutlined } from '../../icons';
import { registerComponentMate, getClassName, mergeAriaDescribedby } from '../../utils';
import { useCompose } from '../compose';

export interface DInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dModel?: [string, DUpdater<string>?];
  dType?: React.HTMLInputTypeAttribute;
  dPrefix?: React.ReactNode;
  dSuffix?: React.ReactNode;
  dPasswordToggle?: boolean;
  dNumbetButton?: boolean;
  dClearable?: boolean;
  dSize?: DSize;
  dMax?: number;
  dMin?: number;
  dStep?: number;
  dPlaceholder?: string;
  dDisabled?: boolean;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (value: string) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DInput' });
export function DInput(props: DInputProps): JSX.Element | null {
  const {
    dType,
    dMax,
    dMin,
    dStep,
    dPlaceholder,
    dDisabled = false,
    dFormControl,
    dModel,
    dPrefix: _dPrefix,
    dSuffix,
    dPasswordToggle = true,
    dNumbetButton = true,
    dClearable = false,
    dSize,
    dInputProps,
    dInputRef,
    onModelChange,

    className,
    onClick,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  //#region Ref
  const inputRef = useRef<HTMLInputElement>(null);
  //#endregion

  const combineInputRef = useForkRef(inputRef, dInputRef);

  const dataRef = useRef<{
    clearLoop?: () => void;
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();
  const [t] = useTranslation();

  const [value, changeValue] = useTwoWayBinding<string>('', dModel, onModelChange, {
    formControl: dFormControl?.control,
  });

  const [isFocus, setIsFocus] = useState(false);
  const [password, setPassword] = useState(true);

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.disabled;

  const changeNumber = useEventCallback((isIncrease = true) => {
    const stepVal = dStep ?? 1;
    let val = (() => {
      if (isNumber(value)) {
        return value;
      }
      const num = value ? Number(value) : 0;
      if (Number.isNaN(num)) {
        return 0;
      }
      return num;
    })();
    val = isIncrease ? val + stepVal : val - stepVal;
    changeValue(Math.max(dMin ?? -Infinity, Math.min(dMax ?? Infinity, val)).toFixed(stepVal.toString().split('.')[1]?.length ?? 0));
  });

  const handleNumberMouseDown = (isIncrease = true) => {
    const loop = () => {
      changeNumber(isIncrease);
      dataRef.current.clearLoop = asyncCapture.setTimeout(() => loop(), 50);
    };
    dataRef.current.clearTid = asyncCapture.setTimeout(() => loop(), 400);
  };

  const handleNumberMouseUp = () => {
    dataRef.current.clearLoop?.();
    dataRef.current.clearTid?.();
  };

  const composeDataAttrs = useCompose(isFocus, disabled);

  return (
    <div
      {...restProps}
      {...composeDataAttrs}
      {...dFormControl?.dataAttrs}
      className={getClassName(className, `${dPrefix}input`, {
        [`${dPrefix}input--${size}`]: size,
        [`${dPrefix}input--number`]: dType === 'number',
        'is-disabled': disabled,
        'is-focus': isFocus,
      })}
      onClick={(e) => {
        onClick?.(e);

        inputRef.current?.focus({ preventScroll: true });
      }}
    >
      {_dPrefix && <div className={`${dPrefix}input__prefix`}>{_dPrefix}</div>}
      <input
        {...dInputProps}
        {...dFormControl?.inputAttrs}
        id={dInputProps?.id ?? dFormControl?.controlId}
        ref={combineInputRef}
        className={getClassName(dInputProps?.className, `${dPrefix}input__input`)}
        placeholder={dPlaceholder}
        value={value}
        type={dType === 'password' ? (password ? 'password' : 'text') : dType}
        max={dMax}
        min={dMin}
        step={dStep}
        disabled={disabled}
        aria-disabled={disabled}
        aria-describedby={mergeAriaDescribedby(dInputProps?.['aria-describedby'], dFormControl?.inputAttrs?.['aria-describedby'])}
        onChange={(e) => {
          dInputProps?.onChange?.(e);

          changeValue(e.currentTarget.value);
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
      {dClearable && !disabled && (
        <button
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}input__clear`)}
          style={{ opacity: value.length > 0 ? 1 : 0 }}
          tabIndex={value.length > 0 ? 0 : -1}
          aria-label={t('Common', 'Clear')}
          onClick={() => {
            changeValue('');
          }}
        >
          <CloseCircleFilled dSize="0.8em" />
        </button>
      )}
      {dType === 'password' && !disabled && (
        <button
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}input__password`)}
          tabIndex={dPasswordToggle ? 0 : -1}
          aria-label={t('DInput', password ? 'Password is not visible' : 'Password is visible')}
          onClick={(e) => {
            e.stopPropagation();

            if (dPasswordToggle) {
              setPassword(!password);
            }
          }}
        >
          {password ? <EyeInvisibleOutlined dSize="0.9em" /> : <EyeOutlined dSize="0.9em" />}
        </button>
      )}
      {dType === 'number' && dNumbetButton && !disabled && (
        <div className={`${dPrefix}input__number-container`}>
          <button
            className={getClassName(`${dPrefix}icon-button`, `${dPrefix}input__number`)}
            tabIndex={-1}
            aria-label={t('DInput', 'Increase number')}
            onMouseDown={(e) => {
              if (e.button === 0) {
                handleNumberMouseDown();
              }
            }}
            onMouseUp={(e) => {
              if (e.button === 0) {
                handleNumberMouseUp();
              }
            }}
            onTouchStart={() => {
              handleNumberMouseDown();
            }}
            onTouchEnd={() => {
              handleNumberMouseUp();
            }}
            onClick={(e) => {
              e.stopPropagation();

              changeNumber();
            }}
          >
            <DCustomIcon viewBox="0 0 24 24" dSize="0.9em">
              <path d="M19.637 16.4369C19.0513 17.0227 18.1015 17.0227 17.5157 16.4369L11.8589 10.7801L6.20202 16.4369C5.61623 17.0227 4.66648 17.0227 4.0807 16.4369C3.49491 15.8511 3.49491 14.9014 4.0807 14.3156L10.7982 7.59809C11.384 7.01231 12.3337 7.01231 12.9195 7.59809L19.637 14.3156C20.2228 14.9014 20.2228 15.8511 19.637 16.4369Z"></path>
            </DCustomIcon>
          </button>
          <button
            className={getClassName(`${dPrefix}icon-button`, `${dPrefix}input__number`)}
            tabIndex={-1}
            aria-label={t('DInput', 'Decrease number')}
            onMouseDown={(e) => {
              if (e.button === 0) {
                handleNumberMouseDown(false);
              }
            }}
            onMouseUp={(e) => {
              if (e.button === 0) {
                handleNumberMouseUp();
              }
            }}
            onTouchStart={() => {
              handleNumberMouseDown(false);
            }}
            onTouchEnd={() => {
              handleNumberMouseUp();
            }}
            onClick={(e) => {
              e.stopPropagation();

              changeNumber(false);
            }}
          >
            <DCustomIcon viewBox="0 0 24 24" dSize="0.9em">
              <path d="M4.08045 7.59809C4.66624 7.01231 5.61599 7.01231 6.20177 7.59809L11.8586 13.2549L17.5155 7.59809C18.1013 7.01231 19.051 7.01231 19.6368 7.59809C20.2226 8.18388 20.2226 9.13363 19.6368 9.71941L12.9193 16.4369C12.3335 17.0227 11.3838 17.0227 10.798 16.4369L4.08045 9.71941C3.49467 9.13363 3.49467 8.18388 4.08045 7.59809Z"></path>
            </DCustomIcon>
          </button>
        </div>
      )}
      {dSuffix && <div className={`${dPrefix}input__suffix`}>{dSuffix}</div>}
    </div>
  );
}
