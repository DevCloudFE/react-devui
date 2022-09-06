import type { ImmerHook } from './useImmer';

import { freeze, produce } from 'immer';

import { useForceUpdate } from './useForceUpdate';
import { useUnmount } from './useUnmount';

export function createGlobalState<S>(): () => ImmerHook<S | undefined>;
export function createGlobalState<S>(initialValue: S): () => ImmerHook<S>;
export function createGlobalState<S>(initialValue?: S): () => ImmerHook<S | undefined> {
  const store = {
    state: freeze(typeof initialValue === 'function' ? initialValue() : initialValue, true),
    setState(updater: any) {
      const prev = store.state;
      if (typeof updater === 'function') {
        store.state = produce(store.state, updater);
      } else {
        store.state = freeze(updater);
      }
      if (!Object.is(store.state, prev)) {
        for (const update of store.updates) {
          update();
        }
      }
    },
    updates: new Set<() => void>(),
  };

  return () => {
    const forceUpdate = useForceUpdate();
    if (!store.updates.has(forceUpdate)) {
      store.updates.add(forceUpdate);
    }

    useUnmount(() => {
      store.updates.delete(forceUpdate);
    });

    return [store.state, store.setState];
  };
}
