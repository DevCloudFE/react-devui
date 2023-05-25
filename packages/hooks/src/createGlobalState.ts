import type { ImmerHook, Updater } from './useImmer';

import { freeze, produce } from 'immer';
import { useState } from 'react';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useUnmount } from './useUnmount';

interface GlobalStateHook<S> {
  (): ImmerHook<S>;
  readonly state: S;
  setState: Updater<S>;
}

/**
 * @deprecated since version 19, try to use `rcl-store`
 */
export function createGlobalState<S>(): GlobalStateHook<S | undefined>;
export function createGlobalState<S>(initialValue: S): GlobalStateHook<S>;
export function createGlobalState<S>(initialValue?: S): GlobalStateHook<S | undefined> {
  const store = {
    state: freeze(typeof initialValue === 'function' ? initialValue() : initialValue, true),
    setState(updater: any) {
      if (typeof updater === 'function') {
        store.state = produce(store.state, updater);
      } else {
        store.state = freeze(updater);
      }

      for (const update of store.updates) {
        update(store.state);
      }
    },
    updates: new Set<(...args: any[]) => any>(),
  };

  return new Proxy(
    () => {
      const [state, setState] = useState(store.state);

      // eslint-disable-next-line react-hooks/exhaustive-deps
      useIsomorphicLayoutEffect(() => {
        if (!store.updates.has(setState)) {
          store.updates.add(setState);
        }
      });

      useUnmount(() => {
        store.updates.delete(setState);
      });

      return [state, store.setState];
    },
    {
      get(target, prop, receiver) {
        if (prop === 'state') {
          return store.state;
        }
        if (prop === 'setState') {
          return store.setState;
        }
        return Reflect.get(target, prop, receiver);
      },
    }
  ) as any;
}
