import { isEqual } from 'lodash';
import { useEffect, useRef } from 'react';

export function useValueChange<T>(
  value: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange?: (value: any) => void,
  deep = false
) {
  const dataRef = useRef(value);

  useEffect(() => {
    if (deep && !isEqual(value, dataRef.current)) {
      onValueChange?.(value);
      dataRef.current = value;
    }
    if (!deep && !Object.is(value, dataRef.current)) {
      onValueChange?.(value);
      dataRef.current = value;
    }
  }, [deep, onValueChange, value]);
}
