import { isFunction } from 'lodash';
import { useCallback } from 'react';

function setRef(ref: any, value: any): void {
  if (isFunction(ref)) {
    ref(value);
  } else if (!!ref && 'current' in ref) {
    ref.current = value;
  }
}

export function useForkRef<T>(refA?: React.ForwardedRef<T>, refB?: React.ForwardedRef<T>): React.RefCallback<T> {
  return useCallback(
    (refValue) => {
      setRef(refA, refValue);
      setRef(refB, refValue);
    },
    [refA, refB]
  );
}
