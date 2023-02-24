import type { DCloneHTMLElement, DSize } from '../../utils/types';
import type { DFormControl } from '../form';

import { isUndefined } from 'lodash';
import React, { useRef } from 'react';

import { ClockCircleOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { useDValue, useGeneralContext } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DDateInput } from '../_date-input';
import { getCols, orderTime } from '../_date-input/utils';
import { DButton } from '../button';
import { useComponentConfig, usePrefixConfig, useTranslation } from '../root';
import { DPanel } from './Panel';

export interface DTimePickerRef {
  updatePosition: () => void;
}

export interface DTimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    inputLeft?: React.ForwardedRef<HTMLInputElement>;
    inputRight?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: Date | null | [Date, Date];
  dFormat?: string;
  dVisible?: boolean;
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dOrder?: 'ascend' | 'descend' | false;
  dPlaceholder?: string | [string?, string?];
  dRange?: boolean;
  dSize?: DSize;
  dClearable?: boolean;
  dDisabled?: boolean;
  dConfigTime?: (
    unit: 'hour' | 'minute' | 'second',
    value: number,
    position: 'start' | 'end',
    current: [Date | null, Date | null]
  ) => { disabled?: boolean; hidden?: boolean };
  d12Hour?: boolean;
  dPopupClassName?: string;
  dInputRender?: [
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?,
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?
  ];
  onModelChange?: (date: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onClear?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTimePicker' as const });
function TimePicker(props: DTimePickerProps, ref: React.ForwardedRef<DTimePickerRef>): JSX.Element | null {
  const {
    dRef,
    dFormControl,
    dModel,
    dFormat,
    dVisible,
    dPlacement = 'bottom-left',
    dOrder = 'ascend',
    dPlaceholder,
    dRange = false,
    dSize,
    dClearable = false,
    dDisabled = false,
    dConfigTime,
    d12Hour = false,
    dPopupClassName,
    dInputRender,
    onModelChange,
    onVisibleChange,
    afterVisibleChange,
    onClear,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const updatePanelRef = useRef<(date: Date) => void>(null);
  //#endregion

  const [t] = useTranslation();

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);

  const size = dSize ?? gSize;
  const disabled = (dDisabled || gDisabled || dFormControl?.control.disabled) ?? false;

  const format = isUndefined(dFormat) ? (d12Hour ? 'hh:mm:ss A' : 'HH:mm:ss') : dFormat;

  const [placeholderLeft = t('TimePicker', dRange ? 'Start time' : 'Select time'), placeholderRight = t('TimePicker', 'End time')] = (
    dRange ? dPlaceholder ?? [] : [dPlaceholder]
  ) as [string?, string?];

  return (
    <DDateInput
      {...restProps}
      ref={ref}
      dRef={dRef}
      dClassNamePrefix="time-picker"
      dFormControl={dFormControl}
      dModel={dModel}
      dFormat={format}
      dVisible={visible}
      dPlacement={dPlacement}
      dOrder={(date) => orderTime(date, dOrder)}
      dPlaceholder={[placeholderLeft, placeholderRight]}
      dSuffix={<ClockCircleOutlined />}
      dRange={dRange}
      dSize={size}
      dClearable={dClearable}
      dDisabled={disabled}
      dInputRender={dInputRender}
      onModelChange={onModelChange}
      onVisibleChange={changeVisible}
      onUpdatePanel={(date) => {
        updatePanelRef.current?.(date);
      }}
      afterVisibleChange={afterVisibleChange}
      onClear={onClear}
    >
      {({ date, isFocus, changeDate, renderPopup }) =>
        renderPopup(
          <div className={getClassName(dPopupClassName, `${dPrefix}time-picker__popup`)}>
            <DPanel
              ref={updatePanelRef}
              dTime={date[isFocus[0] ? 0 : 1]}
              dCols={getCols(format)}
              d12Hour={d12Hour}
              dConfigTime={dConfigTime ? (...args) => dConfigTime(...args, isFocus[0] ? 'start' : 'end', date) : undefined}
              onTimeChange={changeDate}
            ></DPanel>
            <div className={`${dPrefix}time-picker__footer`}>
              <DButton
                onClick={() => {
                  const now = new Date();
                  changeDate(now);
                  updatePanelRef.current?.(now);

                  changeVisible(false);
                }}
                dType="link"
              >
                {t('TimePicker', 'Now')}
              </DButton>
            </div>
          </div>
        )
      }
    </DDateInput>
  );
}

export const DTimePicker = React.forwardRef(TimePicker);
