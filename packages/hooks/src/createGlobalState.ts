import type { ImmerHook } from './useImmer';

import { freeze } from 'immer';

import { useImmer } from './useImmer';
import { useUnmount } from './useUnmount';

export function createGlobalState<S>(): () => ImmerHook<S | undefined>;
export function createGlobalState<S>(initialValue: S): () => ImmerHook<S>;
export function createGlobalState<S>(initialValue?: S): () => ImmerHook<S | undefined> {
  const store = {
    state: freeze(typeof initialValue === 'function' ? initialValue() : initialValue, true),
    setState(updater: any) {
      for (const update of store.updates) {
        update(updater);
      }
    },
    updates: new Set<(...args: any[]) => any>(),
  };

  return () => {
    const [state, setState] = useImmer(store.state);
    store.state = state;

    if (!store.updates.has(setState)) {
      store.updates.add(setState);
    }

    useUnmount(() => {
      store.updates.delete(setState);
    });

    return [state, store.setState];
  };
}
