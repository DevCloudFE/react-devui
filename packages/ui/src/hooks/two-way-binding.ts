import type { Updater } from './immer';

import { isEqual } from 'lodash';
import { useCallback } from 'react';

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

  const currentValue = formControlEnable ? (formControlValue as T) : value;

  const changeValue = useCallback(
    (val: T) => {
      if (formControlEnable) {
        if (formControlName) {
          if (!isEqual(val, currentValue)) {
            onFormControlValueChange?.(val, formControlName);
          }
        } else {
          console.warn('Please add formControlName to component that in FormControl');
        }
      } else {
        setValue?.(val);
        setAutoValue(val);
        if (!isEqual(val, currentValue)) {
          onValueChange?.(val);
        }
      }
    },
    [currentValue, formControlEnable, formControlName, onFormControlValueChange, onValueChange, setAutoValue, setValue]
  );

  return [currentValue, changeValue];
}
