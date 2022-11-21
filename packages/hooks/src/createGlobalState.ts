import type { ImmerHook } from './useImmer';

import { freeze, produce } from 'immer';
import { useState } from 'react';

import { useUnmount } from './useUnmount';

export function createGlobalState<S>(): () => ImmerHook<S | undefined>;
export function createGlobalState<S>(initialValue: S): () => ImmerHook<S>;
export function createGlobalState<S>(initialValue?: S): () => ImmerHook<S | undefined> {
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

  return () => {
    const [state, setState] = useState(store.state);

    if (!store.updates.has(setState)) {
      store.updates.add(setState);
    }

    useUnmount(() => {
      store.updates.delete(setState);
    });

    return [state, store.setState];
  };
}
