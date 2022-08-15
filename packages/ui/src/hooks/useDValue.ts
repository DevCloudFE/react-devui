import type { DFormControlInject } from '../components/form';
import type { DraftFunction } from '@react-devui/hooks/useImmer';

import { freeze, produce } from 'immer';
import { isFunction, isUndefined } from 'lodash';
import { useState } from 'react';

import { useEventCallback } from '@react-devui/hooks';

export function useDValue<T, S = T>(
  initialValue: T | (() => T),
  value?: T,
  onChange?: (value: S) => void,
  deepCompare?: (previous: T, current: S) => boolean,
  formControlInject?: DFormControlInject
): [T, (arg: S | DraftFunction<S>) => S] {
  const [_value, setValue] = useState(initialValue);
  const currentValue: T = isUndefined(formControlInject) ? (isUndefined(value) ? _value : value) : formControlInject[0];

  const changeValue = useEventCallback((updater: any) => {
    const newValue = isFunction(updater) ? produce(currentValue, updater) : freeze(updater);
    const shouldUpdate = deepCompare ? !deepCompare(currentValue, newValue) : !Object.is(currentValue, newValue);
    if (shouldUpdate) {
      setValue(newValue);
      onChange?.(newValue);
      if (!isUndefined(formControlInject)) {
        formControlInject[1](newValue);
      }
    }
    return newValue;
  });

  return [currentValue, changeValue];
}
