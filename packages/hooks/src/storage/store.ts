import type { AbstractStorage } from './storage';

import { useMemo } from 'react';

class Store {
  private _listeners: (() => void)[] = [];
  private _key: any;
  private _storage: AbstractStorage<any, any>;

  constructor(key: any, storage: AbstractStorage<any, any>) {
    this._key = key;
    this._storage = storage;
  }

  subscribe(onStoreChange: () => void) {
    this._listeners = this._listeners.concat([onStoreChange]);
    return () => {
      this._listeners = this._listeners.filter((f) => f !== onStoreChange);
    };
  }

  getSnapshot() {
    return this._storage.getItem(this._key);
  }

  emitChange() {
    for (const listener of this._listeners) {
      listener();
    }
  }
}

export const stores = new Map<any, Store>();

export function useStore(key: any, storage: AbstractStorage<any, any>) {
  return useMemo(() => {
    let store = stores.get(key);
    if (!store) {
      store = new Store(key, storage);
      stores.set(key, store);
    }
    return {
      subscribe: store.subscribe.bind(store),
      getSnapshot: store.getSnapshot.bind(store),
      emitChange: store.emitChange.bind(store),
    };
  }, [key, storage]);
}
