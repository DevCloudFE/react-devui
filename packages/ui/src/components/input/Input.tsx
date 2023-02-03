import type { DCloneHTMLElement, DSize } from '../../utils/types';
import type { DFormControl } from '../form';

import { isUndefined } from 'lodash';
import { useMemo, useRef, useState } from 'react';
import { Subject, fromEvent, takeUntil, first } from 'rxjs';

import { useAsync, useForceUpdate, useForkRef, useUnmount } from '@react-devui/hooks';
import { CloseCircleFilled, DCustomIcon, EyeInvisibleOutlined, EyeOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DBaseDesign } from '../_base-design';
import { DBaseInput } from '../_base-input';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig, useTranslation } from '../root';

export interface DInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: string;
  dType?: React.HTMLInputTypeAttribute;
  dPrefix?: React.ReactNode;
  dSuffix?: React.ReactNode;
  dPassword?: boolean;
  dNumbetButton?: boolean;
  dClearable?: boolean;
  dSize?: DSize;
  dMax?: number;
  dMin?: number;
  dStep?: number;
  dInteger?: boolean;
  dPlaceholder?: string;
  dDisabled?: boolean;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (value: string) => void;
  onClear?: () => void;
  onPasswordChange?: (value: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DInput' as const });
export function DInput(props: DInputProps): JSX.Element | null {
  const {
    dRef,
    dFormControl,
    dModel,
    dType,
    dPrefix: dPrefixNode,
    dSuffix,
    dPassword,
    dNumbetButton = true,
    dClearable = false,
    dSize,
    dMax,
    dMin,
    dStep,
    dInteger = false,
    dPlaceholder,
    dDisabled = false,
    dInputRender,
    onModelChange,
    onClear,
    onPasswordChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const inputRef = useRef<HTMLInputElement>(null);
  const combineInputRef = useForkRef(inputRef, dRef?.input);
  //#endregion

  const dataRef = useRef<{
    showValue: string;
    prevValue: string;
    clearLoop?: () => void;
    clearTid?: () => void;
  }>({
    showValue: '',
    prevValue: '',
  });

  const async = useAsync();
  const [t] = useTranslation();
  const forceUpdate = useForceUpdate();

  const [password, changePassword] = useDValue<boolean>(true, dPassword, onPasswordChange);

  const onDestroy$ = useMemo(() => new Subject<void>(), []);
  const formControlInject = useFormControl(dFormControl);
  const [_value, changeValue] = useDValue<string>('', dModel, onModelChange, undefined, formControlInject);
  if (_value !== dataRef.current.prevValue) {
    dataRef.current.showValue = dataRef.current.prevValue = _value;
  }

  const [isFocus, setIsFocus] = useState(false);

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const changeNumber = (isIncrease = true) => {
    const stepVal = dStep ?? 1;
    const newVal = (() => {
      let val = Number(dataRef.current.showValue);
      if (Number.isNaN(val)) {
        return 0;
      }
      if (dInteger && !Number.isInteger(val)) {
        val = Math.round(val);
      }
      return isIncrease ? val + stepVal : val - stepVal;
    })();
    changeValue(Math.max(dMin ?? -Infinity, Math.min(dMax ?? Infinity, newVal)).toFixed(stepVal.toString().split('.')[1]?.length ?? 0));
  };

  const handleNumberMouseUp = () => {
    dataRef.current.clearLoop?.();
    dataRef.current.clearTid?.();
  };

  const handleNumberMouseDown = (isIncrease = true) => {
    const loop = () => {
      changeNumber(isIncrease);
      dataRef.current.clearLoop = async.setTimeout(() => loop(), 50);
    };
    dataRef.current.clearTid = async.setTimeout(() => loop(), 400);

    fromEvent(window, 'mouseup')
      .pipe(takeUntil(onDestroy$), first())
      .subscribe({
        next: () => {
          handleNumberMouseUp();
        },
      });
  };

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.target !== inputRef.current && e.button === 0) {
      e.preventDefault();
    }
  };

  useUnmount(() => {
    handleNumberMouseUp();

    onDestroy$.next();
    onDestroy$.complete();
  });

  return (
    <DBaseDesign
      dComposeDesign={{
        active: isFocus,
        disabled: disabled,
      }}
      dFormDesign={{
        control: dFormControl,
      }}
    >
      {({ render: renderBaseDesign }) =>
        renderBaseDesign(
          <div
            {...restProps}
            className={getClassName(restProps.className, `${dPrefix}input`, {
              [`${dPrefix}input--${size}`]: size,
              [`${dPrefix}input--button-right`]: dType === 'number' && dNumbetButton && !disabled && !checkNodeExist(dSuffix),
              'is-disabled': disabled,
              'is-focus': isFocus,
            })}
            onMouseDown={(e) => {
              restProps.onMouseDown?.(e);

              preventBlur(e);
            }}
            onMouseUp={(e) => {
              restProps.onMouseUp?.(e);

              preventBlur(e);
            }}
            onClick={(e) => {
              restProps.onClick?.(e);

              inputRef.current?.focus({ preventScroll: true });
            }}
          >
            {checkNodeExist(dPrefixNode) && <div className={`${dPrefix}input__prefix`}>{dPrefixNode}</div>}
            <DBaseInput dFormControl={dFormControl} dLabelFor>
              {({ render: renderBaseInput }) => {
                const input = renderBaseInput(
                  <input
                    ref={combineInputRef}
                    className={`${dPrefix}input__input`}
                    placeholder={dPlaceholder}
                    value={dataRef.current.showValue}
                    type={dType === 'password' ? (password ? 'password' : 'text') : dType}
                    max={dMax}
                    min={dMin}
                    step={dStep}
                    disabled={disabled}
                    onChange={(e) => {
                      dataRef.current.showValue = e.currentTarget.value;
                      forceUpdate();
                      const val = Number(dataRef.current.showValue);
                      if (
                        (!isUndefined(dMax) && val > dMax) ||
                        (!isUndefined(dMin) && val < dMin) ||
                        (dInteger && !Number.isInteger(val))
                      ) {
                        return;
                      }
                      changeValue(dataRef.current.showValue);
                    }}
                    onFocus={() => {
                      setIsFocus(true);
                    }}
                    onBlur={() => {
                      if (dType === 'number') {
                        if (dataRef.current.showValue) {
                          let val = Number(dataRef.current.showValue);
                          if (!isUndefined(dMax) && val > dMax) {
                            val = dMax;
                          }
                          if (!isUndefined(dMin) && val < dMin) {
                            val = dMin;
                          }
                          if (dInteger && !Number.isInteger(val)) {
                            val = Math.round(val);
                          }
                          changeValue(val.toString());
                        } else {
                          changeValue('');
                        }
                      }
                      dataRef.current.showValue = _value;
                      setIsFocus(false);
                    }}
                  />
                );

                return isUndefined(dInputRender) ? input : dInputRender(input);
              }}
            </DBaseInput>
            {dClearable && !disabled && (
              <div
                className={`${dPrefix}input__clear`}
                style={{ opacity: dataRef.current.showValue.length > 0 ? 1 : 0 }}
                role="button"
                aria-label={t('Clear')}
                onClick={() => {
                  changeValue('');
                  onClear?.();
                }}
              >
                <CloseCircleFilled />
              </div>
            )}
            {dType === 'password' && !disabled && (
              <div
                className={`${dPrefix}input__password`}
                role="button"
                aria-label={t('Input', password ? 'Password is not visible' : 'Password is visible')}
                onClick={() => {
                  changePassword((prevPassword) => !prevPassword);
                }}
              >
                {password ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </div>
            )}
            {dType === 'number' && dNumbetButton && !disabled && (
              <div className={`${dPrefix}input__number-container`}>
                <div
                  className={`${dPrefix}input__number`}
                  role="button"
                  aria-label={t('Input', 'Increase number')}
                  onMouseDown={(e) => {
                    if (e.button === 0) {
                      handleNumberMouseDown();
                    }
                  }}
                  onTouchStart={() => {
                    handleNumberMouseDown();
                  }}
                  onTouchEnd={() => {
                    handleNumberMouseUp();
                  }}
                  onClick={() => {
                    changeNumber();
                  }}
                >
                  <DCustomIcon viewBox="0 0 24 24">
                    <path d="M19.637 16.4369C19.0513 17.0227 18.1015 17.0227 17.5157 16.4369L11.8589 10.7801L6.20202 16.4369C5.61623 17.0227 4.66648 17.0227 4.0807 16.4369C3.49491 15.8511 3.49491 14.9014 4.0807 14.3156L10.7982 7.59809C11.384 7.01231 12.3337 7.01231 12.9195 7.59809L19.637 14.3156C20.2228 14.9014 20.2228 15.8511 19.637 16.4369Z"></path>
                  </DCustomIcon>
                </div>
                <div
                  className={`${dPrefix}input__number`}
                  role="button"
                  aria-label={t('Input', 'Decrease number')}
                  onMouseDown={(e) => {
                    if (e.button === 0) {
                      handleNumberMouseDown(false);
                    }
                  }}
                  onTouchStart={() => {
                    handleNumberMouseDown(false);
                  }}
                  onTouchEnd={() => {
                    handleNumberMouseUp();
                  }}
                  onClick={() => {
                    changeNumber(false);
                  }}
                >
                  <DCustomIcon viewBox="0 0 24 24">
                    <path d="M4.08045 7.59809C4.66624 7.01231 5.61599 7.01231 6.20177 7.59809L11.8586 13.2549L17.5155 7.59809C18.1013 7.01231 19.051 7.01231 19.6368 7.59809C20.2226 8.18388 20.2226 9.13363 19.6368 9.71941L12.9193 16.4369C12.3335 17.0227 11.3838 17.0227 10.798 16.4369L4.08045 9.71941C3.49467 9.13363 3.49467 8.18388 4.08045 7.59809Z"></path>
                  </DCustomIcon>
                </div>
              </div>
            )}
            {checkNodeExist(dSuffix) && <div className={`${dPrefix}input__suffix`}>{dSuffix}</div>}
          </div>
        )
      }
    </DBaseDesign>
  );
}
