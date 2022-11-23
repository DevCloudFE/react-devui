import type { DCloneHTMLElement, DSize } from '../../utils/types';
import type { DDateInputRef } from '../_date-input';
import type { DFormControl } from '../form';
import type { DTimePickerProps } from '../time-picker';
import type { DPanelPrivateProps as DTimePickerPanelPrivateProps } from '../time-picker/Panel';

import { isBoolean, isUndefined } from 'lodash';
import React, { useRef } from 'react';

import { CalendarOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { useGeneralContext } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DDateInput } from '../_date-input';
import { getCols, orderDate } from '../_date-input/utils';
import { DButton } from '../button';
import { useComponentConfig, usePrefixConfig, useTranslation } from '../root';
import { DTag } from '../tag';
import { DPanel as DTimePickerPanel } from '../time-picker/Panel';
import { DPanel } from './Panel';

export interface DDatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
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
  dPresetDate?: Record<string, () => Date | [Date, Date]>;
  dConfigDate?: (date: Date, position: 'start' | 'end', current: [Date | null, Date | null]) => { disabled?: boolean };
  dShowTime?: boolean | Pick<DTimePickerProps, 'd12Hour' | 'dConfigTime'>;
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

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDatePicker' as const });
function DatePicker(props: DDatePickerProps, ref: React.ForwardedRef<DDateInputRef>): JSX.Element | null {
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
    dPresetDate,
    dConfigDate,
    dShowTime = false,
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
  const updateTimePickerPanelRef = useRef<(date: Date) => void>(null);
  //#endregion

  const [t] = useTranslation();

  const size = dSize ?? gSize;
  const disabled = (dDisabled || gDisabled || dFormControl?.control.disabled) ?? false;

  const format = isUndefined(dFormat)
    ? dShowTime
      ? !isBoolean(dShowTime) && dShowTime.d12Hour
        ? 'YYYY-MM-DD hh:mm:ss A'
        : 'YYYY-MM-DD HH:mm:ss'
      : `YYYY-MM-DD`
    : dFormat;

  const [placeholderLeft = t('DatePicker', dRange ? 'Start date' : 'Select date'), placeholderRight = t('DatePicker', 'End date')] = (
    dRange ? dPlaceholder ?? [] : [dPlaceholder]
  ) as [string?, string?];

  const { d12Hour: t12Hour = false, dConfigTime } = isBoolean(dShowTime)
    ? ({} as Pick<DTimePickerProps, 'd12Hour' | 'dConfigTime'>)
    : dShowTime;

  return (
    <DDateInput
      {...restProps}
      ref={ref}
      dRef={dRef}
      dClassNamePrefix="date-picker"
      dFormControl={dFormControl}
      dModel={dModel}
      dFormat={format}
      dVisible={dVisible}
      dPlacement={dPlacement}
      dOrder={(date) => orderDate(date, dOrder, dShowTime ? undefined : 'date')}
      dPlaceholder={[placeholderLeft, placeholderRight]}
      dSuffix={<CalendarOutlined />}
      dRange={dRange}
      dSize={size}
      dClearable={dClearable}
      dDisabled={disabled}
      dInputRender={dInputRender}
      onModelChange={onModelChange}
      onVisibleChange={onVisibleChange}
      onUpdatePanel={(date) => {
        updatePanelRef.current?.(date);
        updateTimePickerPanelRef.current?.(date);
      }}
      afterVisibleChange={afterVisibleChange}
      onClear={onClear}
    >
      {({ date, isFocus, changeDate, renderPopup }) => {
        const index = isFocus[0] ? 0 : 1;
        const position = isFocus[0] ? 'start' : 'end';

        return renderPopup(
          <div className={getClassName(dPopupClassName, `${dPrefix}date-picker__popup`)}>
            <DPanel
              ref={updatePanelRef}
              dDateCurrentSelected={date[index]}
              dDateAnotherSelected={date[isFocus[0] ? 1 : 0]}
              dConfigDate={dConfigDate ? (...args) => dConfigDate(...args, position, date) : undefined}
              onDateChange={changeDate}
            ></DPanel>
            {dShowTime &&
              React.cloneElement<DTimePickerPanelPrivateProps>(
                <DTimePickerPanel
                  ref={updateTimePickerPanelRef}
                  dTime={date[index]}
                  dCols={getCols(format)}
                  d12Hour={t12Hour}
                  dConfigTime={dConfigTime ? (...args) => dConfigTime(...args, position, date) : undefined}
                  onTimeChange={changeDate}
                />,
                {
                  __header: true,
                }
              )}
            <div
              className={getClassName(`${dPrefix}date-picker__footer`, {
                [`${dPrefix}date-picker__footer--custom`]: dPresetDate,
              })}
            >
              {dPresetDate ? (
                Object.keys(dPresetDate).map((name) => {
                  const handleClick = () => {
                    const d = dPresetDate[name]();
                    changeDate(d);
                    updatePanelRef.current?.(d[index]);
                    updateTimePickerPanelRef.current?.(d[index]);
                  };

                  return (
                    <DTag
                      key={name}
                      className={`${dPrefix}date-picker__footer-button`}
                      role="button"
                      onClick={handleClick}
                      dTheme="primary"
                    >
                      {name}
                    </DTag>
                  );
                })
              ) : (
                <DButton
                  onClick={() => {
                    const now = new Date();
                    changeDate(now);
                    updatePanelRef.current?.(now);
                    updateTimePickerPanelRef.current?.(now);
                  }}
                  dType="link"
                >
                  {t('DatePicker', dShowTime ? 'Now' : 'Today')}
                </DButton>
              )}
            </div>
          </div>
        );
      }}
    </DDateInput>
  );
}

export const DDatePicker = React.forwardRef(DatePicker);
