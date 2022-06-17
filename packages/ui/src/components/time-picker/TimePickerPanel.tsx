import { freeze } from 'immer';
import { isUndefined } from 'lodash';
import React, { useImperativeHandle, useRef } from 'react';

import { useEventCallback, useForceUpdate, usePrefixConfig } from '../../hooks';
import { getClassName, scrollTo } from '../../utils';
import dayjs from './utils';

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
  scrollToTime: (time: Date) => void;
}

export interface DTimePickerPanelProps {
  dTime: Date | null;
  dConfigOptions?: (unit: 'hour' | 'minute' | 'second', value: number) => { disabled?: boolean; hidden?: boolean };
  d12Hour?: boolean;
  onCellClick?: (time: Date) => void;
}

function TimePickerPanel(props: DTimePickerPanelProps, ref: React.ForwardedRef<DTimePickerPanelRef>) {
  const { dTime, dConfigOptions, d12Hour = false, onCellClick } = props;

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
    A: 'AM' | 'PM';
  }>({ A: 'AM' });

  const forceUpdate = useForceUpdate();

  const time = dTime ? dayjs(dTime) : dayjs('00:00:00', 'HH:mm:ss');
  const activeA = dTime ? (time.get('hour') < 12 ? 'AM' : 'PM') : dataRef.current.A;

  const scrollToTime = useEventCallback((t: Date, unit?: 'hour' | 'minute' | 'second') => {
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
      scrollToTime,
    }),
    [scrollToTime]
  );

  return (
    <>
      <ul ref={ulHRef} className={`${dPrefix}time-picker-panel__column`}>
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
          const { disabled, hidden } = dConfigOptions?.('hour', h) ?? {};

          return hidden ? null : (
            <li
              key={h}
              className={getClassName(`${dPrefix}time-picker-panel__cell`, {
                'is-active': dTime && time.get('hour') === h,
                'is-disabled': disabled,
              })}
              data-h={h}
              onClick={() => {
                const newT = time.set('hour', h).toDate();
                scrollToTime(newT, 'hour');
                onCellClick?.(newT);
              }}
            >
              {_h}
            </li>
          );
        })}
      </ul>
      <ul ref={ulMRef} className={`${dPrefix}time-picker-panel__column`}>
        {M60.map((_m) => {
          const m = Number(_m);
          const { disabled, hidden } = dConfigOptions?.('minute', m) ?? {};

          return hidden ? null : (
            <li
              key={m}
              className={getClassName(`${dPrefix}time-picker-panel__cell`, {
                'is-active': dTime && time.get('minute') === m,
                'is-disabled': disabled,
              })}
              data-m={m}
              onClick={() => {
                const newT = time.set('minute', m).toDate();
                scrollToTime(newT, 'minute');
                onCellClick?.(newT);
              }}
            >
              {_m}
            </li>
          );
        })}
      </ul>
      <ul ref={ulSRef} className={`${dPrefix}time-picker-panel__column`}>
        {S60.map((_s) => {
          const s = Number(_s);
          const { disabled, hidden } = dConfigOptions?.('second', s) ?? {};

          return hidden ? null : (
            <li
              key={s}
              className={getClassName(`${dPrefix}time-picker-panel__cell`, {
                'is-active': dTime && time.get('second') === s,
                'is-disabled': disabled,
              })}
              data-s={s}
              onClick={() => {
                const newT = time.set('second', s).toDate();
                scrollToTime(newT, 'second');
                onCellClick?.(newT);
              }}
            >
              {_s}
            </li>
          );
        })}
      </ul>
      {d12Hour && (
        <ul className={`${dPrefix}time-picker-panel__column`}>
          {(['AM', 'PM'] as const).map((A) => (
            <li
              key={A}
              className={getClassName(`${dPrefix}time-picker-panel__cell`, {
                'is-active': activeA === A,
              })}
              onClick={() => {
                if (dTime) {
                  if (activeA !== A) {
                    const newT = time.set('hour', time.get('hour') + (A === 'AM' ? -12 : 12)).toDate();
                    onCellClick?.(newT);
                  }
                } else {
                  dataRef.current.A = A;
                  forceUpdate();
                }
              }}
            >
              {A}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export const DTimePickerPanel = React.forwardRef(TimePickerPanel);
