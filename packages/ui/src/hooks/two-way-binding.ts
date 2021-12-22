import type { Updater as IUpdater } from './immer';

import { freeze, produce } from 'immer';
import { isFunction, isUndefined } from 'lodash';
import { useCallback, useState } from 'react';

import { DFormItemContext } from '../components/form';
import { useCustomContext } from './context';

export type Updater<S> = (value: S) => void;

export function useTwoWayBinding<T>(
  initialValue: T | (() => T),
  input?: [T, Updater<T>?],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange?: (value: any) => void,
  formControlOptions?: {
    enable?: boolean;
    name?: string;
  }
): [T, IUpdater<T>] {
  const [{ dModel, onModelChange }, formItemContext] = useCustomContext(DFormItemContext);
  const formControlEnable = formControlOptions && (formControlOptions.enable ?? true) && formItemContext !== null;
  const formControlName = formControlOptions?.name;

  const setValue = input?.[1];
  const [autoValue, setAutoValue] = useState<T>(initialValue);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const value = isUndefined(input?.[0]) ? autoValue : input![0];

  const currentValue = formControlEnable ? (dModel as T) : value;

  const changeValue = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updater: any) => {
      const val = isFunction(updater) ? produce(currentValue, updater) : freeze(updater);

      if (formControlEnable) {
        if (formControlName) {
          if (!Object.is(val, currentValue)) {
            onModelChange?.(val, formControlName);
          }
        } else {
          console.warn('Please add `dFormControlName` to component that in `DFormControl`');
        }
      } else {
        setValue?.(val);
        setAutoValue(val);
        if (!Object.is(val, currentValue)) {
          onValueChange?.(val);
        }
      }
    },
    [currentValue, formControlEnable, formControlName, onModelChange, onValueChange, setValue]
  );

  return [currentValue, changeValue];
}
