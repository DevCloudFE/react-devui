import type { Dayjs, UnitType } from 'dayjs';

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { useAsync, useEventCallback, usePrefixConfig, useTranslation } from '../../hooks';
import { DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { dayjs } from '../dayjs';

export interface DPanelRef {
  updateView: (time: Date) => void;
}

export interface DPanelProps {
  dDate: Date | null;
  dAnotherDate: Date | null;
  dConfigDate?: (date: Date) => { disabled?: boolean };
  onDateChange?: (time: Date) => void;
}

function Panel(props: DPanelProps, ref: React.ForwardedRef<DPanelRef>): JSX.Element | null {
  const { dDate, dAnotherDate, dConfigDate, onDateChange } = props;

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

  const weekList: Dayjs[][] = (() => {
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

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    asyncGroup.fromEvent<MouseEvent>(window, 'mouseup').subscribe({
      next: () => {
        handleButtonMouseUp();
      },
    });

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture]);

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
        <button {...getButtonProps('year', -1)} className={`${dPrefix}date-picker__header-button`} title={t('DatePicker', 'Previous year')}>
          <DoubleLeftOutlined />
        </button>
        <button
          {...getButtonProps('month', -1)}
          className={`${dPrefix}date-picker__header-button`}
          title={t('DatePicker', 'Previous month')}
        >
          <LeftOutlined />
        </button>
        <span className={`${dPrefix}date-picker__header-content`}>{showDate.format(lang === 'zh-Hant' ? 'YYYY年 M月' : 'MMM YYYY')}</span>
        <button {...getButtonProps('month', 1)} className={`${dPrefix}date-picker__header-button`} title={t('DatePicker', 'Next month')}>
          <RightOutlined />
        </button>
        <button {...getButtonProps('year', 1)} className={`${dPrefix}date-picker__header-button`} title={t('DatePicker', 'Next year')}>
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
          {weekList.map((week, index1) => (
            <tr key={index1}>
              {week.map((d, index2) => {
                const { disabled } = dConfigDate?.(d.toDate()) ?? {};
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

export const DPanel = React.forwardRef(Panel);
