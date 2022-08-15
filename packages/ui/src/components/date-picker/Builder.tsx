import type { DSize } from '../../utils';
import type { DFormControl } from '../form';
import type { Dayjs } from 'dayjs';

import { isArray, isNull } from 'lodash';
import React, { useEffect, useRef } from 'react';

import { useAsync, useForceUpdate, useImmer } from '@react-devui/hooks';

import { useDValue, useGeneralContext } from '../../hooks';
import { DDateInput } from '../_date-input';
import { dayjs } from '../dayjs';
import { useFormControl } from '../form';
import { deepCompareDate } from './utils';

export interface DBuilderRef {
  updatePosition: () => void;
}

export interface DBuilderRenderProps {
  pbDate: Date | null;
  pbCurrentDate: [Date | null, Date | null];
  pbPosition: 'start' | 'end';
  changeValue: (date: Date | [Date, Date]) => void;
}

export interface DBuilderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: (props: DBuilderRenderProps) => React.ReactNode;
  dClassNamePrefix: string;
  dFormControl?: DFormControl;
  dModel?: Date | null | [Date, Date];
  dFormat: string;
  dVisible?: boolean;
  dSuffix?: React.ReactNode;
  dPlaceholder: [string, string];
  dOrder: (date: [Dayjs | Date, Dayjs | Date]) => boolean;
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dSize?: DSize;
  dClearable?: boolean;
  dRange?: boolean;
  dDisabled?: boolean;
  dPopupClassName?: string;
  dInputProps?:
    | React.InputHTMLAttributes<HTMLInputElement>
    | [React.InputHTMLAttributes<HTMLInputElement>?, React.InputHTMLAttributes<HTMLInputElement>?];
  dInputRef?: React.Ref<HTMLInputElement> | [React.Ref<HTMLInputElement>?, React.Ref<HTMLInputElement>?];
  onModelChange?: (date: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onClear?: () => void;
  onUpdatePanel?: (date: Date) => void;
}

function Builder(props: DBuilderProps, ref: React.ForwardedRef<DBuilderRef>): JSX.Element | null {
  const {
    children,
    dClassNamePrefix,
    dFormControl,
    dModel,
    dFormat,
    dVisible,
    dSuffix,
    dPlaceholder,
    dOrder,
    dPlacement = 'bottom-left',
    dSize,
    dClearable = false,
    dRange = false,
    dDisabled = false,
    dPopupClassName,
    dInputProps,
    dInputRef,
    onModelChange,
    onVisibleChange,
    afterVisibleChange,
    onClear,
    onUpdatePanel,

    ...restProps
  } = props;

  //#region Ref
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const dataRef = useRef<{
    focusAnother: boolean;
    clearTid?: () => void;
    inputValue: [string, string];
    rangeDate: [Date | null, Date | null];
  }>({
    focusAnother: false,
    inputValue: ['', ''],
    rangeDate: [null, null],
  });

  const asyncCapture = useAsync();
  const forceUpdate = useForceUpdate();

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

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
    (a, b) => deepCompareDate(a, b, dFormat),
    formControlInject
  );
  const changeValue = (date: Date, position: 'start' | 'end') => {
    dataRef.current.inputValue[position === 'start' ? 0 : 1] = dayjs(date).format(dFormat);
    if (dRange) {
      if (isNull(_value)) {
        dataRef.current.rangeDate[position === 'start' ? 0 : 1] = date;
        if (dataRef.current.rangeDate.every((v) => !isNull(v))) {
          dataRef.current.focusAnother = dOrder(dataRef.current.rangeDate as [Date, Date]);
          if (dataRef.current.focusAnother) {
            dataRef.current.rangeDate.reverse();
            dataRef.current.inputValue.reverse();
          }
          _changeValue(dataRef.current.rangeDate as [Date, Date]);
        }
      } else {
        _changeValue((draft) => {
          (draft as [Date, Date])[position === 'start' ? 0 : 1] = date;
          dataRef.current.focusAnother = dOrder(draft as [Date, Date]);
          if (dataRef.current.focusAnother) {
            (draft as [Date, Date]).reverse();
            dataRef.current.inputValue.reverse();
          }
        });
      }
    } else {
      _changeValue(date);
    }
    forceUpdate();
  };

  let [valueLeft, valueRight = null] = (isArray(_value) ? _value : [_value, null]) as [Date | null, Date | null];
  if (dRange) {
    if (isNull(_value)) {
      [valueLeft, valueRight] = dataRef.current.rangeDate;
    } else {
      dataRef.current.rangeDate = [null, null];
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
    dataRef.current.inputValue[0] = isNull(valueLeft) ? '' : dayjs(valueLeft).format(dFormat);
  }
  if (!isFocus[1]) {
    dataRef.current.inputValue[1] = isNull(valueRight) ? '' : dayjs(valueRight).format(dFormat);
  }

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
      placeholder: isLeft ? dPlaceholder[0] : dPlaceholder[1],
      onChange: (e) => {
        inputProps?.onChange?.(e);

        const val = e.currentTarget.value;
        dataRef.current.inputValue[index] = val;
        if (dayjs(val, dFormat, true).isValid()) {
          const date = dayjs(val, dFormat).toDate();
          onUpdatePanel?.(date);
          changeValue(date, position);
        }
        forceUpdate();
      },
      onKeyDown: (e) => {
        inputProps?.onKeyDown?.(e);

        if (e.code === 'Enter') {
          if (dayjs(dataRef.current.inputValue[index], dFormat, true).isValid()) {
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
            dataRef.current.inputValue[index] = isNull(value) ? '' : dayjs(value).format(dFormat);
          }
          forceUpdate();
        }
      },
      onFocus: (e) => {
        inputProps?.onFocus?.(e);

        if (value && isFocus[isLeft ? 1 : 0]) {
          onUpdatePanel?.(value);
        }
        handleFocusChange(true, position);
      },
      onBlur: (e) => {
        inputProps?.onBlur?.(e);

        handleFocusChange(false, position);
      },
    };
  };

  const latestFocus = useRef<'start' | 'end'>('start');
  if (isFocus[0]) {
    latestFocus.current = 'start';
  }
  if (isFocus[1]) {
    latestFocus.current = 'end';
  }

  return (
    <DDateInput
      {...restProps}
      ref={ref}
      dClassNamePrefix={dClassNamePrefix}
      dFormControl={dFormControl}
      dVisible={visible}
      dPlacement={dPlacement}
      dSuffix={dSuffix}
      dSize={size}
      dRange={dRange}
      dClearable={dClearable && !isNull(_value)}
      dDisabled={disabled}
      dInputProps={[getInputProps(true), getInputProps(false)]}
      dInputRef={[dInputRefLeft, dInputRefRight]}
      onVisibleChange={changeVisible}
      afterVisibleChange={afterVisibleChange}
      onClear={() => {
        onClear?.();

        _changeValue(null);
      }}
    >
      {({ diPopupRef, diStyle, diOnMouseDown, diOnMouseUp }) => (
        <div ref={diPopupRef} className={dPopupClassName} style={diStyle} onMouseDown={diOnMouseDown} onMouseUp={diOnMouseUp}>
          {children({
            pbDate: latestFocus.current === 'start' ? valueLeft : valueRight,
            pbCurrentDate: dRange ? (isNull(_value) ? dataRef.current.rangeDate : (_value as [Date, Date])) : [valueLeft, null],
            pbPosition: latestFocus.current,
            changeValue: (date) => {
              if (isArray(date)) {
                dataRef.current.inputValue = date.map((d) => dayjs(d).format(dFormat)) as [string, string];
                _changeValue(date);
              } else {
                changeValue(date, latestFocus.current);
              }
            },
          })}
        </div>
      )}
    </DDateInput>
  );
}

export const DBuilder = React.forwardRef(Builder);
