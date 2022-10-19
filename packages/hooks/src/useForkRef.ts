import { isFunction, isObject } from 'lodash';
import { useCallback } from 'react';

function setRef(ref: any, value: any): void {
  if (isFunction(ref)) {
    ref(value);
  } else if (isObject(ref) && 'current' in ref) {
    ref['current'] = value;
  }
}

export function useForkRef<T>(...refs: (React.ForwardedRef<T> | undefined)[]): React.RefCallback<T> {
  return useCallback(
    (refValue) => {
      refs.forEach((ref) => {
        setRef(ref, refValue);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...refs]
  );
}
