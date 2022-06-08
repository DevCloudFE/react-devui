import type { AbstractControl } from '../../components/form';
import type { Updater } from './useImmer';

import { freeze, produce } from 'immer';
import { isArray, isFunction, isUndefined } from 'lodash';
import { useEffect, useState } from 'react';

import { DFormContext } from '../../components/form';
import { useContextOptional } from '../context';
import { useEventCallback } from './useEventCallback';

export type DUpdater<S> = (value: S) => void;

export function useTwoWayBinding<T, S = T>(
  initialValue: T | (() => T),
  input?: [T, DUpdater<S>?],
  onValueChange?: (value: S) => void,
  opt?: {
    formControl?: AbstractControl;
    deepCompare?: (previous: T, current: S) => boolean;
  }
): [T, Updater<S>] {
  if (!isUndefined(input) && !isArray(input)) {
    throw new Error('Please check `input` value');
  }

  const { gInstance: formInstance } = useContextOptional(DFormContext);

  const formControl = opt?.formControl;
  const deepCompare = opt?.deepCompare;

  const setValue = input?.[1];
  const [autoValue, setAutoValue] = useState<T>(initialValue);
  const value = isUndefined(input) ? autoValue : input[0];

  const currentValue = formControl ? formControl.value : value;

  const changeValue = useEventCallback((updater: any) => {
    const val = isFunction(updater) ? produce(currentValue, updater) : freeze(updater);
    const shouldUpdate = deepCompare ? !deepCompare(currentValue, val) : !Object.is(currentValue, val);
    if (shouldUpdate) {
      if (formControl) {
        formControl.markAsDirty(true);
        formControl.setValue(val);
        formInstance?.updateForm();
        onValueChange?.(val);
      } else {
        setValue?.(val);
        setAutoValue(val);
        onValueChange?.(val);
      }
    }
  });

  useEffect(() => {
    if (formControl) {
      const ob = formControl.asyncVerifyComplete$.subscribe({
        next: (formControl) => {
          if (formControl.dirty) {
            formInstance?.updateForm();
          }
        },
      });

      return () => {
        ob.unsubscribe();
      };
    }
  }, [formControl, formInstance]);

  return [currentValue, changeValue];
}
