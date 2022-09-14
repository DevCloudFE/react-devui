import type { DTimePickerProps } from '../time-picker';
import type { DPanelPropsWithPrivate as DTimePickerPanelPropsWithPrivate, DPanelRef as DTimePickerPanelRef } from '../time-picker/Panel';
import type { DBuilderProps } from './Builder';
import type { DPanelRef } from './Panel';

import { isBoolean, isUndefined } from 'lodash';
import React, { useRef } from 'react';

import { CalendarOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { useComponentConfig, usePrefixConfig, useTranslation } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DButton } from '../button';
import { DTag } from '../tag';
import { DPanel as DTimePickerPanel } from '../time-picker/Panel';
import { DBuilder } from './Builder';
import { DPanel } from './Panel';
import { getCols, orderDate } from './utils';

export interface DDatePickerRef {
  updatePosition: () => void;
}

export interface DDatePickerProps extends Omit<DBuilderProps, 'dFormat' | 'dSuffix' | 'dPlaceholder' | 'dOrder' | 'onUpdatePanel'> {
  dFormat?: string;
  dPlaceholder?: string | [string?, string?];
  dOrder?: 'ascend' | 'descend' | null;
  dPresetDate?: Record<string, () => Date | [Date, Date]>;
  dConfigDate?: (date: Date, position: 'start' | 'end', current: [Date | null, Date | null]) => { disabled?: boolean };
  dShowTime?: boolean | Pick<DTimePickerProps, 'd12Hour' | 'dConfigTime'>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDatePicker' as const });
function DatePicker(props: DDatePickerProps, ref: React.ForwardedRef<DDatePickerRef>): JSX.Element | null {
  const {
    dFormat,
    dPlaceholder,
    dOrder = 'ascend',
    dRange = false,
    dPresetDate,
    dConfigDate,
    dPopupClassName,
    dShowTime = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dDPPRef = useRef<DPanelRef>(null);
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

  const { d12Hour: t12Hour, dConfigTime } = isBoolean(dShowTime) ? ({} as Pick<DTimePickerProps, 'd12Hour' | 'dConfigTime'>) : dShowTime;

  return (
    <DBuilder
      {...restProps}
      ref={ref}
      dClassNamePrefix="date-picker"
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
          <DPanel
            ref={dDPPRef}
            dDate={pbDate}
            dAnotherDate={pbCurrentDate[pbPosition === 'start' ? 1 : 0]}
            dConfigDate={dConfigDate ? (...args) => dConfigDate(...args, pbPosition, pbCurrentDate) : undefined}
            onDateChange={changeValue}
          ></DPanel>
          {dShowTime &&
            React.createElement<React.PropsWithoutRef<DTimePickerPanelPropsWithPrivate> & React.RefAttributes<DTimePickerPanelRef>>(
              DTimePickerPanel,
              {
                ref: dTPPRef,
                dTime: pbDate,
                dCols: getCols(format),
                d12Hour: t12Hour,
                dConfigTime: dConfigTime ? (...args) => dConfigTime(...args, pbPosition, pbCurrentDate) : undefined,
                onTimeChange: changeValue,
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
                  changeValue(d);
                  dDPPRef.current?.updateView(d[pbPosition === 'start' ? 0 : 1]);
                  dTPPRef.current?.updateView(d[pbPosition === 'start' ? 0 : 1]);
                };

                return (
                  <DTag key={name} className={`${dPrefix}date-picker__footer-button`} role="button" onClick={handleClick} dTheme="primary">
                    {name}
                  </DTag>
                );
              })
            ) : (
              <DButton
                onClick={() => {
                  const now = new Date();
                  changeValue(now);
                  dDPPRef.current?.updateView(now);
                  dTPPRef.current?.updateView(now);
                }}
                dType="link"
              >
                {t('DatePicker', dShowTime ? 'Now' : 'Today')}
              </DButton>
            )}
          </div>
        </>
      )}
    </DBuilder>
  );
}

export const DDatePicker = React.forwardRef(DatePicker);
