import type { Updater } from './immer';

import { isEqual } from 'lodash';
import { useCallback, useMemo } from 'react';

import { DFormItemContext } from '../components/form';
import { useCustomContext } from './context';
import { useImmer } from './immer';

export function useTwoWayBinding<T>(
  initialValue: T | (() => T),
  input?: [T, Updater<T>?],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange?: (value: any) => void,
  formControlOptions?: {
    enable?: boolean;
    name?: string;
  }
): [T, (value: T) => void] {
  const [{ value: formControlValue, onValueChange: onFormControlValueChange }, formItemContext] = useCustomContext(DFormItemContext);
  const formControlEnable = formControlOptions && (formControlOptions.enable ?? true) && formItemContext !== null;
  const formControlName = formControlOptions?.name;

  const setValue = input?.[1];
  const [autoValue, setAutoValue] = useImmer<T>(initialValue);
  const value = input?.[0] ?? autoValue;

  const dataRef = useMemo(() => {
    return { current: formControlEnable ? (formControlValue as T) : value };
  }, [formControlEnable, formControlValue, value]);

  const changeValue = useCallback(
    (val: T) => {
      if (formControlEnable) {
        if (formControlName) {
          if (!isEqual(val, dataRef.current)) {
            dataRef.current = val;
            onFormControlValueChange?.(val, formControlName);
          }
        } else {
          console.warn('Please add formControlName to component that in FormControl');
        }
      } else {
        setValue?.(val);
        setAutoValue(val);
        if (!isEqual(val, dataRef.current)) {
          dataRef.current = val;
          onValueChange?.(val);
        }
      }
    },
    [dataRef, formControlEnable, formControlName, onFormControlValueChange, onValueChange, setAutoValue, setValue]
  );

  return [dataRef.current, changeValue];
}
