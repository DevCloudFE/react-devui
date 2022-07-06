import type { Dayjs, UnitType } from 'dayjs';

import React, { useImperativeHandle, useRef, useState } from 'react';

import { useAsync, useEventCallback, usePrefixConfig, useTranslation } from '../../hooks';
import { DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { dayjs } from '../dayjs';

export interface DDatePickerPanelRef {
  updateView: (time: Date) => void;
}

export interface DDatePickerPanelProps {
  dDate: Date | null;
  dAnotherDate: Date | null;
  dConfigOptions?: (date: Date) => { disabled?: boolean };
  onDateChange?: (time: Date) => void;
}

function DatePickerPanel(props: DDatePickerPanelProps, ref: React.ForwardedRef<DDatePickerPanelRef>) {
  const { dDate, dAnotherDate, dConfigOptions, onDateChange } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const dataRef = useRef<{
    clearLoop?: () => void;
    clearTid?: () => void;
    clearHoverTid?: () => void;
  }>({});

  const asyncCapture = useAsync();
  const [t, lang] = useTranslation();

  const activeDate = dDate ? dayjs(dDate) : dayjs().set('hour', 0).set('minute', 0).set('second', 0);
  const anotherDate = dAnotherDate ? dayjs(dAnotherDate) : null;

  const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);

  const [showDate, setShowDate] = useState<Dayjs>(activeDate);
  const updateView = useEventCallback((t: Date) => {
    setShowDate(dayjs(t));
  });

  const handleButtonDown = (unit: UnitType, value: number) => {
    const loop = () => {
      setShowDate((d) => d.set(unit, d.get(unit) + value));
      dataRef.current.clearLoop = asyncCapture.setTimeout(() => loop(), 50);
    };
    dataRef.current.clearTid = asyncCapture.setTimeout(() => loop(), 400);
  };

  const handleButtonMouseUp = () => {
    dataRef.current.clearLoop?.();
    dataRef.current.clearTid?.();
  };

  const getButtonProps = (unit: UnitType, value: number) =>
    ({
      onMouseDown: (e) => {
        if (e.button === 0) {
          handleButtonDown(unit, value);
        }
      },
      onMouseUp: (e) => {
        if (e.button === 0) {
          handleButtonMouseUp();
        }
      },
      onTouchStart: () => {
        handleButtonDown(unit, value);
      },
      onTouchEnd: () => {
        handleButtonMouseUp();
      },
      onClick: () => {
        updateView(showDate.set(unit, showDate.get(unit) + value).toDate());
      },
    } as React.ButtonHTMLAttributes<HTMLButtonElement>);

  const options: Dayjs[][] = (() => {
    const firstDay = showDate.set('date', 1);
    const month = [];
    let week = [];
    for (let num = 0, addDay = -firstDay.day(); num < 7 * 6; num++, addDay++) {
      week.push(firstDay.add(addDay, 'day'));
      if (week.length === 7) {
        month.push(week);
        week = [];
      }
    }
    return month;
  })();

  useImperativeHandle(
    ref,
    () => ({
      updateView,
    }),
    [updateView]
  );

  return (
    <div className={`${dPrefix}date-picker__panel`}>
      <div className={`${dPrefix}date-picker__header`}>
        <button
          title={t('DatePicker', 'Previous year')}
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}date-picker__header-button`)}
          {...getButtonProps('year', -1)}
        >
          <DoubleLeftOutlined />
        </button>
        <button
          title={t('DatePicker', 'Previous month')}
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}date-picker__header-button`)}
          {...getButtonProps('month', -1)}
        >
          <LeftOutlined />
        </button>
        <span className={`${dPrefix}date-picker__header-content`}>{showDate.format(lang === 'zh-Hant' ? 'YYYY年 M月' : 'MMM YYYY')}</span>
        <button
          title={t('DatePicker', 'Next month')}
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}date-picker__header-button`)}
          {...getButtonProps('month', 1)}
        >
          <RightOutlined />
        </button>
        <button
          title={t('DatePicker', 'Next year')}
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}date-picker__header-button`)}
          {...getButtonProps('year', 1)}
        >
          <DoubleRightOutlined />
        </button>
      </div>
      <table className={`${dPrefix}date-picker__content`}>
        <thead>
          <tr>
            {dayjs.weekdaysMin().map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {options.map((week, index1) => (
            <tr key={index1}>
              {week.map((d, index2) => {
                const { disabled } = dConfigOptions?.(d.toDate()) ?? {};
                const isActive = dDate && d.isSame(activeDate, 'date');
                const isAnother = anotherDate && d.isSame(anotherDate, 'date');
                const isHover = !isActive && !isAnother && anotherDate && d.isSame(hoverDate, 'date');

                return (
                  <td
                    key={index2}
                    style={{ pointerEvents: disabled ? 'none' : undefined }}
                    onClick={() => {
                      updateView(d.toDate());
                      onDateChange?.(d.toDate());
                    }}
                    onMouseEnter={() => {
                      dataRef.current.clearHoverTid?.();
                      setHoverDate(d);
                    }}
                    onMouseLeave={() => {
                      dataRef.current.clearHoverTid?.();
                      dataRef.current.clearHoverTid = asyncCapture.setTimeout(() => setHoverDate(null), 50);
                    }}
                  >
                    <div
                      className={getClassName(`${dPrefix}date-picker__cell`, {
                        [`${dPrefix}date-picker__cell--out-month`]: d.get('month') !== showDate.get('month'),
                        [`${dPrefix}date-picker__cell--today`]: !isActive && !isAnother && d.isSame(dayjs(), 'date'),
                        'is-active': isActive,
                        'is-another': !isActive && isAnother,
                        'is-hover': isHover,
                        'is-between':
                          !isActive && !isAnother && !isHover && dDate && anotherDate && d.isBetween(activeDate, anotherDate, 'date'),
                        'is-between-hover': !isActive && hoverDate && anotherDate && d.isBetween(hoverDate, anotherDate, 'date'),
                        'is-disabled': disabled,
                      })}
                    >
                      {d.get('date')}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const DDatePickerPanel = React.forwardRef(DatePickerPanel);
