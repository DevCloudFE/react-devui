import type { DFormControlInject } from '../components/form';
import type { DraftFunction } from '@react-devui/hooks/useImmer';

import { freeze, produce } from 'immer';
import { isFunction, isUndefined } from 'lodash';
import { useRef, useState } from 'react';

export function useDValue<T, S = T>(
  initialValue: T | (() => T),
  value?: T,
  onChange?: (value: S) => void,
  deepCompare?: (previous: T, current: S) => boolean,
  formControlInject?: DFormControlInject
): [T, (arg: S | DraftFunction<S>) => S] {
  const [_value, setValue] = useState(initialValue);

  const valueRef = useRef<T>(_value);
  valueRef.current = isUndefined(formControlInject) ? (isUndefined(value) ? _value : value) : formControlInject[0];

  return [
    valueRef.current,
    (updater: any) => {
      const newValue = isFunction(updater) ? produce(valueRef.current, updater) : freeze(updater);
      const shouldUpdate = deepCompare ? !deepCompare(valueRef.current, newValue) : !Object.is(valueRef.current, newValue);
      if (shouldUpdate) {
        setValue(newValue);
        onChange?.(newValue);
        if (!isUndefined(formControlInject)) {
          formControlInject[1](newValue);
        }
      }
      return newValue;
    },
  ];
}
