import { isUndefined } from 'lodash';
import { useRef } from 'react';

import { useForceUpdate } from '../common';
import { useIsomorphicLayoutEffect } from '../lifecycle';

export function useMemoWithUpdate<T>(factory: () => T, deps: React.DependencyList): [T, (val: T) => void] {
  const forceUpdate = useForceUpdate();

  const prevDeps = useRef<React.DependencyList>();
  const prevVal = useRef<T>();

  const val = (() => {
    if (isUndefined(prevDeps.current) || !deps.every((v, i) => Object.is(v, (prevDeps.current as React.DependencyList)[i]))) {
      return factory();
    }

    return prevVal.current as T;
  })();

  useIsomorphicLayoutEffect(() => {
    prevDeps.current = deps;
    prevVal.current = val;
  });

  return [
    val,
    (v: T) => {
      prevVal.current = v;
      forceUpdate();
    },
  ];
}
