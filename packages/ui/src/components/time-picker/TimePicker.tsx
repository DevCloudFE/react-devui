import type { DBuilderProps } from '../date-picker/Builder';
import type { DPanelRef } from './Panel';

import { isUndefined } from 'lodash';
import React, { useRef } from 'react';

import { useComponentConfig, usePrefixConfig, useTranslation } from '../../hooks';
import { ClockCircleOutlined } from '../../icons';
import { getClassName, registerComponentMate } from '../../utils';
import { DButton } from '../button';
import { DBuilder } from '../date-picker/Builder';
import { getCols, orderTime } from '../date-picker/utils';
import { DPanel } from './Panel';

export interface DTimePickerRef {
  updatePosition: () => void;
}

export interface DTimePickerProps extends Omit<DBuilderProps, 'dFormat' | 'dSuffix' | 'dPlaceholder' | 'dOrder' | 'onUpdatePanel'> {
  dFormat?: string;
  dPlaceholder?: string | [string?, string?];
  dOrder?: 'ascend' | 'descend' | null;
  d12Hour?: boolean;
  dConfigTime?: (
    unit: 'hour' | 'minute' | 'second',
    value: number,
    position: 'start' | 'end',
    current: [Date | null, Date | null]
  ) => { disabled?: boolean; hidden?: boolean };
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTimePicker' });
function TimePicker(props: DTimePickerProps, ref: React.ForwardedRef<DTimePickerRef>): JSX.Element | null {
  const {
    dFormat,
    dPlaceholder,
    dOrder = 'ascend',
    d12Hour = false,
    dRange = false,
    dConfigTime,
    dPopupClassName,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dTPPRef = useRef<DPanelRef>(null);
  //#endregion

  const [t] = useTranslation();

  const format = isUndefined(dFormat) ? (d12Hour ? 'hh:mm:ss A' : 'HH:mm:ss') : dFormat;

  const [placeholderLeft = t('TimePicker', dRange ? 'Start time' : 'Select time'), placeholderRight = t('TimePicker', 'End time')] = (
    dRange ? dPlaceholder ?? [] : [dPlaceholder]
  ) as [string?, string?];

  return (
    <DBuilder
      {...restProps}
      ref={ref}
      dClassNamePrefix="time-picker"
      dFormat={format}
      dSuffix={<ClockCircleOutlined />}
      dPlaceholder={[placeholderLeft, placeholderRight]}
      dOrder={(date) => orderTime(date, dOrder)}
      dRange={dRange}
      dPopupClassName={getClassName(dPopupClassName, `${dPrefix}time-picker__popup`)}
      onUpdatePanel={(date) => {
        dTPPRef.current?.updateView(date);
      }}
    >
      {({ pbDate, pbCurrentDate, pbPosition, changeValue }) => (
        <>
          <DPanel
            ref={dTPPRef}
            dTime={pbDate}
            dCols={getCols(format)}
            d12Hour={d12Hour}
            dConfigTime={dConfigTime ? (...args) => dConfigTime(...args, pbPosition, pbCurrentDate) : undefined}
            onTimeChange={changeValue}
          ></DPanel>
          <div className={`${dPrefix}time-picker__footer`}>
            <DButton
              onClick={() => {
                const now = new Date();
                changeValue(now);
                dTPPRef.current?.updateView(now);
              }}
              dType="link"
            >
              {t('TimePicker', 'Now')}
            </DButton>
          </div>
        </>
      )}
    </DBuilder>
  );
}

export const DTimePicker = React.forwardRef(TimePicker);
