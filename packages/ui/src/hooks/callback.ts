/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from 'immer';
import { useCallback, useRef, useState } from 'react';

import { useIsomorphicLayoutEffect } from './layout-effect';

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

export function useCallbackWithCondition<S>(condition: boolean, fn: () => S): () => S {
  const [initValue] = useState(() => fn());
  const ref = useRef({
    value: initValue,
  });

  return () => {
    if (condition) {
      ref.current.value = fn();
    }
    return ref.current.value;
  };
}

export function useCallbackWithState<S>(fn: (draft: S) => void, initState: S): () => S {
  const ref = useRef({
    state: initState,
    nextState: initState,
  });

  useIsomorphicLayoutEffect(() => {
    ref.current.state = ref.current.nextState;
  });

  return () => {
    ref.current.nextState = produce(ref.current.state, fn);
    return ref.current.nextState;
  };
}
