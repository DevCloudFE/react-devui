import type { DExtendsTimeInputProps } from '../_time-input';
import type { DTimePickerPanelRef } from './TimePickerPanel';

import { isArray, isNull, isUndefined } from 'lodash';
import React, { useEffect, useRef } from 'react';

import { useAsync, useDValue, useForceUpdate, useGeneralContext, useImmer, usePrefixConfig, useTranslation } from '../../hooks';
import { getClassName } from '../../utils';
import { DTimeInput } from '../_time-input';
import { DButton } from '../button';
import { useFormControl } from '../form';
import { DTimePickerPanel } from './TimePickerPanel';
import dayjs, { deepCompareDate, orderTime } from './utils';

export interface DTimePickerRef {
  updatePosition: () => void;
}

export interface DTimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>, DExtendsTimeInputProps {
  dModel?: Date | null | [Date, Date];
  dFormat?: string;
  dVisible?: boolean;
  d12Hour?: boolean;
  dPlaceholder?: string | [string?, string?];
  dConfigOptions?: (
    unit: 'hour' | 'minute' | 'second',
    value: number,
    position: 'start' | 'end'
  ) => { disabled?: boolean; hidden?: boolean };
  dOrder?: 'ascend' | 'descend' | null;
  dPopupClassName?: string;
  dInputProps?:
    | React.InputHTMLAttributes<HTMLInputElement>
    | [React.InputHTMLAttributes<HTMLInputElement>?, React.InputHTMLAttributes<HTMLInputElement>?];
  dInputRef?: React.Ref<HTMLInputElement> | [React.Ref<HTMLInputElement>?, React.Ref<HTMLInputElement>?];
  onModelChange?: (time: any) => void;
}

function TimePicker(props: DTimePickerProps, ref: React.ForwardedRef<DTimePickerRef>) {
  const {
    dModel,
    dFormat,
    dVisible,
    d12Hour = false,
    dPlaceholder,
    dConfigOptions,
    dOrder = 'ascend',
    dPopupClassName,
    dInputProps,
    dInputRef,
    onModelChange,

    dFormControl,
    dSize,
    dRange = false,
    dDisabled = false,
    dClearable = false,
    onVisibleChange,
    onClear,

    className,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const popupRef = useRef<HTMLDivElement>(null);
  const dTPPRef = useRef<DTimePickerPanelRef>(null);
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const dataRef = useRef<{
    focusAnother: boolean;
    clearTid?: () => void;
    inputValue: [string, string];
    time: [Date | null, Date | null];
  }>({
    focusAnother: false,
    inputValue: ['', ''],
    time: [null, null],
  });

  const asyncCapture = useAsync();
  const forceUpdate = useForceUpdate();
  const [t] = useTranslation();

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const format = isUndefined(dFormat) ? (d12Hour ? 'hh:mm:ss A' : 'HH:mm:ss') : dFormat;

  const [dInputRefLeft, dInputRefRight] = (dRange ? dInputRef ?? [] : [dInputRef]) as [
    React.Ref<HTMLInputElement>?,
    React.Ref<HTMLInputElement>?
  ];

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);
  const formControlInject = useFormControl(dFormControl);
  const [_value, _changeValue] = useDValue<Date | null | [Date, Date]>(
    null,
    dModel,
    onModelChange,
    (a, b) => deepCompareDate(a, b, format),
    formControlInject
  );
  const changeValue = (time: Date, position: 'start' | 'end') => {
    dataRef.current.inputValue[position === 'start' ? 0 : 1] = dayjs(time).format(format);
    if (dRange) {
      if (isNull(_value)) {
        dataRef.current.time[position === 'start' ? 0 : 1] = time;
        if (dataRef.current.time.every((v) => !isNull(v))) {
          dataRef.current.focusAnother = orderTime(dataRef.current.time as [Date, Date], dOrder);
          if (dataRef.current.focusAnother) {
            dataRef.current.inputValue.reverse();
          }
          _changeValue(dataRef.current.time as [Date, Date]);
        }
      } else {
        _changeValue((draft) => {
          (draft as [Date, Date])[position === 'start' ? 0 : 1] = time;
          dataRef.current.focusAnother = orderTime(draft as [Date, Date], dOrder);
          if (dataRef.current.focusAnother) {
            dataRef.current.inputValue.reverse();
          }
        });
      }
    } else {
      _changeValue(time);
    }
    forceUpdate();
  };

  let [valueLeft, valueRight = null] = (isArray(_value) ? _value : [_value, null]) as [Date | null, Date | null];
  if (dRange) {
    if (isNull(_value)) {
      [valueLeft, valueRight] = dataRef.current.time;
    } else {
      dataRef.current.time = [null, null];
    }
  }

  const [isFocus, setIsFocus] = useImmer([false, false]);
  const handleFocusChange = (focus: boolean, position: 'start' | 'end') => {
    dataRef.current.clearTid?.();
    if (focus) {
      setIsFocus((draft) => {
        draft.fill(false);
        draft[position === 'start' ? 0 : 1] = true;
      });
    } else {
      dataRef.current.clearTid = asyncCapture.setTimeout(() => {
        setIsFocus([false, false]);
      }, 20);
    }
  };
  if (!isFocus[0]) {
    dataRef.current.inputValue[0] = isNull(valueLeft) ? '' : dayjs(valueLeft).format(format);
  }
  if (!isFocus[1]) {
    dataRef.current.inputValue[1] = isNull(valueRight) ? '' : dayjs(valueRight).format(format);
  }

  const [placeholderLeft = t('DTimePicker', dRange ? 'Start time' : 'Select time'), placeholderRight = t('DTimePicker', 'End time')] = (
    dRange ? dPlaceholder ?? [] : [dPlaceholder]
  ) as [string?, string?];

  useEffect(() => {
    if (dataRef.current.focusAnother && document.activeElement) {
      const el = document.activeElement.parentElement as HTMLElement;
      for (let index = 0; index < el.childElementCount; index++) {
        const element = el.children.item(index) as HTMLElement;
        if (element.tagName.toLowerCase() === 'input' && element !== document.activeElement) {
          element.focus({ preventScroll: true });
          break;
        }
      }
    }
    dataRef.current.focusAnother = false;
  });

  const getInputProps = (isLeft: boolean): React.InputHTMLAttributes<HTMLInputElement> => {
    const [dInputPropsLeft, dInputPropsRight] = (dRange ? dInputProps ?? [] : [dInputProps]) as [
      React.InputHTMLAttributes<HTMLInputElement>?,
      React.InputHTMLAttributes<HTMLInputElement>?
    ];
    const inputProps = isLeft ? dInputPropsLeft : dInputPropsRight;
    const index = isLeft ? 0 : 1;
    const position = isLeft ? 'start' : 'end';
    const value = isLeft ? valueLeft : valueRight;

    return {
      ...inputProps,
      value: dataRef.current.inputValue[index],
      placeholder: isLeft ? placeholderLeft : placeholderRight,
      onChange: (e) => {
        inputProps?.onChange?.(e);

        const val = e.currentTarget.value;
        dataRef.current.inputValue[index] = val;
        if (dayjs(val, format, true).isValid()) {
          const time = dayjs(val, format).toDate();
          dTPPRef.current?.scrollToTime(time);
          changeValue(time, position);
        }
        forceUpdate();
      },
      onKeyDown: (e) => {
        inputProps?.onKeyDown?.(e);

        if (e.code === 'Enter') {
          if (dayjs(dataRef.current.inputValue[index], format, true).isValid()) {
            if (dRange) {
              if (isNull(isLeft ? valueRight : valueLeft)) {
                dataRef.current.focusAnother = true;
              } else {
                changeVisible(false);
              }
            } else {
              changeVisible(false);
            }
          } else {
            dataRef.current.inputValue[index] = isNull(value) ? '' : dayjs(value).format(format);
          }
          forceUpdate();
        }
      },
      onFocus: (e) => {
        inputProps?.onFocus?.(e);

        if (value && isFocus[isLeft ? 1 : 0]) {
          dTPPRef.current?.scrollToTime(value);
        }
        handleFocusChange(true, position);
      },
      onBlur: (e) => {
        inputProps?.onBlur?.(e);

        handleFocusChange(false, position);
      },
    };
  };

  return (
    <DTimeInput
      {...restProps}
      ref={ref}
      className={getClassName(className, `${dPrefix}time-picker`)}
      dFormControl={dFormControl}
      dVisible={visible}
      dSize={size}
      dRange={dRange}
      dClearable={dClearable && !isNull(_value)}
      dDisabled={disabled}
      dInputProps={[getInputProps(true), getInputProps(false)]}
      dInputRef={[dInputRefLeft, dInputRefRight]}
      onVisibleChange={changeVisible}
      onClear={() => {
        onClear?.();

        _changeValue(null);
      }}
    >
      {({ tiStyle, tiOnMouseDown, tiOnMouseUp, ...restSProps }) => (
        <div
          {...restSProps}
          ref={popupRef}
          className={getClassName(dPopupClassName, `${dPrefix}time-picker__popup`)}
          style={tiStyle}
          onMouseDown={tiOnMouseDown}
          onMouseUp={tiOnMouseUp}
        >
          <DTimePickerPanel
            ref={dTPPRef}
            dTime={isFocus[0] ? valueLeft : valueRight}
            dConfigOptions={dConfigOptions ? (...args) => dConfigOptions(...args, isFocus[0] ? 'start' : 'end') : undefined}
            d12Hour={d12Hour}
            onCellClick={(time) => {
              changeValue(time, isFocus[0] ? 'start' : 'end');
            }}
          ></DTimePickerPanel>
          <div className={`${dPrefix}time-picker__footer`}>
            <DButton
              dType="link"
              onClick={() => {
                const now = new Date();
                changeValue(now, isFocus[0] ? 'start' : 'end');
                dTPPRef.current?.scrollToTime(now);
              }}
            >
              {t('DTimePicker', 'Now')}
            </DButton>
          </div>
        </div>
      )}
    </DTimeInput>
  );
}

export const DTimePicker = React.forwardRef(TimePicker);
