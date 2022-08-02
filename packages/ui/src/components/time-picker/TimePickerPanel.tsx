import { freeze } from 'immer';
import { isUndefined } from 'lodash';
import React, { useImperativeHandle, useRef, useState } from 'react';

import { useEventCallback, usePrefixConfig } from '../../hooks';
import { getClassName, scrollTo } from '../../utils';
import { dayjs } from '../dayjs';

const H12 = freeze([
  '12',
  ...Array(11)
    .fill(0)
    .map((n, i) => `${i + 1 < 10 ? '0' : ''}${i + 1}`),
]);

const [H24, M60, S60] = [24, 60, 60].map((num) =>
  freeze(
    Array(num)
      .fill(0)
      .map((n, i) => `${i < 10 ? '0' : ''}${i}`)
  )
);

export interface DTimePickerPanelRef {
  updateView: (time: Date) => void;
}

export interface DTimePickerPanelProps {
  dTime: Date | null;
  dCols: ('hour' | 'minute' | 'second')[];
  d12Hour?: boolean;
  dConfigTime?: (unit: 'hour' | 'minute' | 'second', value: number) => { disabled?: boolean; hidden?: boolean };
  onTimeChange?: (time: Date) => void;
}

export interface DTimePickerPanelPropsWithPrivate extends DTimePickerPanelProps {
  __header?: boolean;
}

function TimePickerPanel(props: DTimePickerPanelProps, ref: React.ForwardedRef<DTimePickerPanelRef>): JSX.Element | null {
  const { dTime, dCols, d12Hour = false, dConfigTime, onTimeChange, __header = false } = props as DTimePickerPanelPropsWithPrivate;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const ulHRef = useRef<HTMLUListElement>(null);
  const ulMRef = useRef<HTMLUListElement>(null);
  const ulSRef = useRef<HTMLUListElement>(null);
  //#endregion

  const dataRef = useRef<{
    clearHTid?: () => void;
    clearMTid?: () => void;
    clearSTid?: () => void;
  }>({});

  const [saveA, setSaveA] = useState<'AM' | 'PM'>('AM');

  const activeTime = dTime ? dayjs(dTime) : dayjs('00:00:00', 'HH:mm:ss');
  const activeA = dTime ? (activeTime.get('hour') < 12 ? 'AM' : 'PM') : saveA;

  const format = (() => {
    const unit = [];
    if (dCols.includes('hour')) {
      unit.push('HH');
    }
    if (dCols.includes('minute')) {
      unit.push('mm');
    }
    if (dCols.includes('second')) {
      unit.push('ss');
    }
    return unit.join(':');
  })();

  const updateView = useEventCallback((t: Date, unit?: 'hour' | 'minute' | 'second') => {
    if (unit === 'hour' || isUndefined(unit)) {
      let hour = t.getHours();
      if (d12Hour) {
        if (activeA === 'AM' && hour > 11) {
          hour -= 12;
        }
        if (activeA === 'PM' && hour < 12) {
          hour += 12;
        }
      }
      if (ulHRef.current) {
        dataRef.current.clearHTid?.();

        dataRef.current.clearHTid = scrollTo(ulHRef.current, {
          top: Array.prototype.indexOf.call(ulHRef.current.children, ulHRef.current.querySelector(`[data-h="${hour}"]`)) * 28,
          behavior: 'smooth',
        });
      }
    }

    if (unit === 'minute' || isUndefined(unit)) {
      const minute = t.getMinutes();
      if (ulMRef.current) {
        dataRef.current.clearMTid?.();
        dataRef.current.clearMTid = scrollTo(ulMRef.current, {
          top: Array.prototype.indexOf.call(ulMRef.current.children, ulMRef.current.querySelector(`[data-m="${minute}"]`)) * 28,
          behavior: 'smooth',
        });
      }
    }

    if (unit === 'second' || isUndefined(unit)) {
      const second = t.getSeconds();
      if (ulSRef.current) {
        dataRef.current.clearSTid?.();
        dataRef.current.clearSTid = scrollTo(ulSRef.current, {
          top: Array.prototype.indexOf.call(ulSRef.current.children, ulSRef.current.querySelector(`[data-s="${second}"]`)) * 28,
          behavior: 'smooth',
        });
      }
    }
  });

  useImperativeHandle(
    ref,
    () => ({
      updateView,
    }),
    [updateView]
  );

  return (
    <div className={`${dPrefix}time-picker__panel`}>
      {__header && <div className={`${dPrefix}time-picker__header`}>{activeTime.format(format)}</div>}
      {dCols.includes('hour') && (
        <ul ref={ulHRef} className={`${dPrefix}time-picker__column`}>
          {(d12Hour ? H12 : H24).map((_h) => {
            let h = Number(_h);
            if (d12Hour) {
              if (activeA === 'AM' && h === 12) {
                h = 0;
              }
              if (activeA === 'PM' && h !== 12) {
                h += 12;
              }
            }
            const { disabled, hidden } = dConfigTime?.('hour', h) ?? {};

            return hidden ? null : (
              <li
                key={h}
                className={getClassName(`${dPrefix}time-picker__cell`, {
                  'is-active': dTime && activeTime.get('hour') === h,
                  'is-disabled': disabled,
                })}
                data-h={h}
                onClick={() => {
                  const newT = activeTime.set('hour', h).toDate();
                  updateView(newT, 'hour');
                  onTimeChange?.(newT);
                }}
              >
                {_h}
              </li>
            );
          })}
        </ul>
      )}
      {dCols.includes('minute') && (
        <ul ref={ulMRef} className={`${dPrefix}time-picker__column`}>
          {M60.map((_m) => {
            const m = Number(_m);
            const { disabled, hidden } = dConfigTime?.('minute', m) ?? {};

            return hidden ? null : (
              <li
                key={m}
                className={getClassName(`${dPrefix}time-picker__cell`, {
                  'is-active': dTime && activeTime.get('minute') === m,
                  'is-disabled': disabled,
                })}
                data-m={m}
                onClick={() => {
                  const newT = activeTime.set('minute', m).toDate();
                  updateView(newT, 'minute');
                  onTimeChange?.(newT);
                }}
              >
                {_m}
              </li>
            );
          })}
        </ul>
      )}
      {dCols.includes('second') && (
        <ul ref={ulSRef} className={`${dPrefix}time-picker__column`}>
          {S60.map((_s) => {
            const s = Number(_s);
            const { disabled, hidden } = dConfigTime?.('second', s) ?? {};

            return hidden ? null : (
              <li
                key={s}
                className={getClassName(`${dPrefix}time-picker__cell`, {
                  'is-active': dTime && activeTime.get('second') === s,
                  'is-disabled': disabled,
                })}
                data-s={s}
                onClick={() => {
                  const newT = activeTime.set('second', s).toDate();
                  updateView(newT, 'second');
                  onTimeChange?.(newT);
                }}
              >
                {_s}
              </li>
            );
          })}
        </ul>
      )}
      {d12Hour && (
        <ul className={`${dPrefix}time-picker__column`}>
          {(['AM', 'PM'] as const).map((A) => (
            <li
              key={A}
              className={getClassName(`${dPrefix}time-picker__cell`, {
                'is-active': activeA === A,
              })}
              onClick={() => {
                if (dTime) {
                  if (activeA !== A) {
                    const newT = activeTime.set('hour', activeTime.get('hour') + (A === 'AM' ? -12 : 12)).toDate();
                    onTimeChange?.(newT);
                  }
                } else {
                  setSaveA(A);
                }
              }}
            >
              {A}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const DTimePickerPanel = React.forwardRef(TimePickerPanel);
