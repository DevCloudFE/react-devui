import type { UnitType } from 'dayjs';

import React, { useImperativeHandle, useMemo, useRef, useState } from 'react';
import { first, fromEvent, Subject, takeUntil } from 'rxjs';

import { useAsync, useUnmount } from '@react-devui/hooks';
import { DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import dayjs from '../../dayjs';
import { usePrefixConfig, useTranslation } from '../root';

export interface DPanelProps {
  dDateCurrentSelected: Date | null;
  dDateAnotherSelected: Date | null;
  dConfigDate: ((date: Date) => { disabled?: boolean }) | undefined;
  onDateChange: (date: Date) => void;
}

function Panel(props: DPanelProps, ref: React.ForwardedRef<(date: Date) => void>): JSX.Element | null {
  const { dDateCurrentSelected, dDateAnotherSelected, dConfigDate, onDateChange } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const dataRef = useRef<{
    clearLoop?: () => void;
    clearTid?: () => void;
    clearHoverTid?: () => void;
  }>({});

  const async = useAsync();
  const [t, lang] = useTranslation();

  const onDestroy$ = useMemo(() => new Subject<void>(), []);
  const dayjsCurrentSelected = dDateCurrentSelected
    ? dayjs(dDateCurrentSelected)
    : dayjs().set('hour', 0).set('minute', 0).set('second', 0);
  const dayjsAnotherSelected = dDateAnotherSelected ? dayjs(dDateAnotherSelected) : null;

  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const [_showDate, setShowDate] = useState<Date>(dayjsCurrentSelected.toDate());
  const showDate = dayjs(_showDate);

  const handleButtonMouseUp = () => {
    dataRef.current.clearLoop?.();
    dataRef.current.clearTid?.();
  };

  const handleButtonDown = (unit: UnitType, value: number) => {
    const loop = () => {
      setShowDate((draft) => {
        const d = dayjs(draft);
        return d.set(unit, d.get(unit) + value).toDate();
      });
      dataRef.current.clearLoop = async.setTimeout(() => loop(), 50);
    };
    dataRef.current.clearTid = async.setTimeout(() => loop(), 400);

    fromEvent(window, 'mouseup')
      .pipe(takeUntil(onDestroy$), first())
      .subscribe({
        next: () => {
          handleButtonMouseUp();
        },
      });
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
        setShowDate((draft) => {
          const d = dayjs(draft);
          return d.set(unit, d.get(unit) + value).toDate();
        });
      },
    } as React.ButtonHTMLAttributes<HTMLButtonElement>);

  const weekList: Date[][] = (() => {
    const firstDay = showDate.set('date', 1);
    const month = [];
    let week = [];
    for (let num = 0, addDay = -firstDay.day(); num < 7 * 6; num++, addDay++) {
      week.push(firstDay.add(addDay, 'day').toDate());
      if (week.length === 7) {
        month.push(week);
        week = [];
      }
    }
    return month;
  })();

  useUnmount(() => {
    handleButtonMouseUp();

    onDestroy$.next();
    onDestroy$.complete();
  });

  useImperativeHandle(ref, () => setShowDate, []);

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
        <span className={`${dPrefix}date-picker__header-content`}>{showDate.format(lang === 'zh-CN' ? 'YYYY年 M月' : 'MMM YYYY')}</span>
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
              {week.map((_d, index2) => {
                const d = dayjs(_d);
                const { disabled } = dConfigDate?.(_d) ?? {};
                const isCurrentSelected = dDateCurrentSelected && d.isSame(dayjsCurrentSelected, 'date');
                const isAnotherSelected = dayjsAnotherSelected && d.isSame(dayjsAnotherSelected, 'date');
                const isHover = !isCurrentSelected && !isAnotherSelected && dayjsAnotherSelected && d.isSame(hoverDate, 'date');
                const isBetween =
                  !isCurrentSelected &&
                  !isCurrentSelected &&
                  !isHover &&
                  dDateCurrentSelected &&
                  dayjsAnotherSelected &&
                  d.isBetween(dayjsCurrentSelected, dayjsAnotherSelected, 'date');
                const isBetweenHover =
                  !isCurrentSelected && hoverDate && dayjsAnotherSelected && d.isBetween(hoverDate, dayjsAnotherSelected, 'date');

                return (
                  <td
                    key={index2}
                    style={{ pointerEvents: disabled ? 'none' : undefined }}
                    onClick={() => {
                      setShowDate(_d);
                      onDateChange(_d);
                    }}
                    onMouseEnter={() => {
                      dataRef.current.clearHoverTid?.();
                      setHoverDate(_d);
                    }}
                    onMouseLeave={() => {
                      dataRef.current.clearHoverTid?.();
                      dataRef.current.clearHoverTid = async.setTimeout(() => setHoverDate(null), 50);
                    }}
                  >
                    <div
                      className={getClassName(`${dPrefix}date-picker__cell`, {
                        [`${dPrefix}date-picker__cell--out-month`]: d.get('month') !== showDate.get('month'),
                        [`${dPrefix}date-picker__cell--today`]: !isCurrentSelected && !isAnotherSelected && d.isSame(dayjs(), 'date'),
                        'is-current-selected': isCurrentSelected,
                        'is-another-selected': !isCurrentSelected && isAnotherSelected,
                        'is-hover': isHover,
                        'is-between': isBetween,
                        'is-between-hover': isBetweenHover,
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
