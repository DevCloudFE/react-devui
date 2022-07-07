import type { DTimePickerProps } from '../time-picker';
import type { DTimePickerPanelPropsWithPrivate, DTimePickerPanelRef } from '../time-picker/TimePickerPanel';
import type { DDatePickerPanelRef } from './DatePickerPanel';
import type { DPickerBuilderProps } from './PickerBuilder';

import { isBoolean, isUndefined } from 'lodash';
import React, { useRef } from 'react';

import { useComponentConfig, usePrefixConfig, useTranslation } from '../../hooks';
import { CalendarOutlined } from '../../icons';
import { getClassName, registerComponentMate } from '../../utils';
import { DButton } from '../button';
import { DTag } from '../tag';
import { DTimePickerPanel } from '../time-picker/TimePickerPanel';
import { DDatePickerPanel } from './DatePickerPanel';
import { DPickerBuilder } from './PickerBuilder';
import { getCols, orderDate } from './utils';

export interface DDatePickerRef {
  updatePosition: () => void;
}

export interface DDatePickerProps extends Omit<DPickerBuilderProps, 'dFormat' | 'dSuffix' | 'dPlaceholder' | 'dOrder' | 'onUpdatePanel'> {
  dFormat?: string;
  dPlaceholder?: string | [string?, string?];
  dOrder?: 'ascend' | 'descend' | null;
  dPresetOptions?: Record<string, () => Date | [Date, Date]>;
  dConfigOptions?: (date: Date, position: 'start' | 'end', current: [Date | null, Date | null]) => { disabled?: boolean };
  dShowTime?: boolean | Pick<DTimePickerProps, 'd12Hour' | 'dConfigOptions'>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDatePicker' });
function DatePicker(props: DDatePickerProps, ref: React.ForwardedRef<DDatePickerRef>): JSX.Element | null {
  const {
    dFormat,
    dPlaceholder,
    dOrder = 'ascend',
    dRange = false,
    dPresetOptions,
    dConfigOptions,
    dPopupClassName,
    dShowTime = false,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dDPPRef = useRef<DDatePickerPanelRef>(null);
  const dTPPRef = useRef<DTimePickerPanelRef>(null);
  //#endregion

  const [t] = useTranslation();

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

  const { d12Hour: t12Hour, dConfigOptions: tConfigOptions } = isBoolean(dShowTime)
    ? ({} as Pick<DTimePickerProps, 'd12Hour' | 'dConfigOptions'>)
    : dShowTime;

  return (
    <DPickerBuilder
      {...restProps}
      ref={ref}
      className={getClassName(className, `${dPrefix}date-picker`)}
      dFormat={format}
      dSuffix={<CalendarOutlined />}
      dPlaceholder={[placeholderLeft, placeholderRight]}
      dOrder={(date) => orderDate(date, dOrder, dShowTime ? undefined : 'date')}
      dRange={dRange}
      dPopupClassName={getClassName(dPopupClassName, `${dPrefix}date-picker__popup`)}
      onUpdatePanel={(date) => {
        dDPPRef.current?.updateView(date);
        dTPPRef.current?.updateView(date);
      }}
    >
      {({ pbDate, pbCurrentDate, pbPosition, changeValue }) => (
        <>
          <DDatePickerPanel
            ref={dDPPRef}
            dDate={pbDate}
            dAnotherDate={pbCurrentDate[pbPosition === 'start' ? 1 : 0]}
            dConfigOptions={dConfigOptions ? (...args) => dConfigOptions(...args, pbPosition, pbCurrentDate) : undefined}
            onDateChange={changeValue}
          ></DDatePickerPanel>
          {dShowTime &&
            React.createElement<React.PropsWithoutRef<DTimePickerPanelPropsWithPrivate> & React.RefAttributes<DTimePickerPanelRef>>(
              DTimePickerPanel,
              {
                ref: dTPPRef,
                dTime: pbDate,
                dCols: getCols(format),
                d12Hour: t12Hour,
                dConfigOptions: tConfigOptions ? (...args) => tConfigOptions(...args, pbPosition, pbCurrentDate) : undefined,
                onTimeChange: changeValue,
                __header: true,
              }
            )}
          <div
            className={getClassName(`${dPrefix}date-picker__footer`, {
              [`${dPrefix}date-picker__footer--custom`]: dPresetOptions,
            })}
          >
            {dPresetOptions ? (
              Object.keys(dPresetOptions).map((name) => (
                <DTag
                  key={name}
                  className={`${dPrefix}date-picker__footer-button`}
                  dTheme="primary"
                  onClick={() => {
                    const d = dPresetOptions[name]();
                    changeValue(d);
                    dDPPRef.current?.updateView(d[pbPosition === 'start' ? 0 : 1]);
                    dTPPRef.current?.updateView(d[pbPosition === 'start' ? 0 : 1]);
                  }}
                >
                  {name}
                </DTag>
              ))
            ) : (
              <DButton
                dType="link"
                onClick={() => {
                  const now = new Date();
                  changeValue(now);
                  dDPPRef.current?.updateView(now);
                  dTPPRef.current?.updateView(now);
                }}
              >
                {t('DatePicker', dShowTime ? 'Now' : 'Today')}
              </DButton>
            )}
          </div>
        </>
      )}
    </DPickerBuilder>
  );
}

export const DDatePicker = React.forwardRef(DatePicker);
