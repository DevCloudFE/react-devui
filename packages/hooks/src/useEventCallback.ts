import { useCallback, useRef } from 'react';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export function useEventCallback<T extends (...args: any[]) => any>(callback: T): T {
  const ref = useRef<any>(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });

  useIsomorphicLayoutEffect(() => {
    ref.current = callback;
  });

  return useCallback((...args: any[]) => {
    const fn = ref.current;
    return fn(...args);
  }, []) as T;
}
