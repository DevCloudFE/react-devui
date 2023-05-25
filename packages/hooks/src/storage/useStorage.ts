import type { AbstractParserOptions } from './parser';
import type { AbstractStorage } from './storage';

import { isNull, isUndefined } from 'lodash';
import { useMemo, useSyncExternalStore } from 'react';

import { LocalStorageService } from './localStorage';
import { STRING_PARSER } from './parser';
import { useStore, stores } from './store';

interface UseStorageMethod<V> {
  set: (value: V) => void;
  remove: () => void;
}

export function useStorage<V, K = string>(
  key: K | null,
  defaultValue?: undefined,
  parser?: keyof AbstractParserOptions<any>
): { readonly value: V | null } & UseStorageMethod<V>;
export function useStorage<V, K = string>(
  key: K,
  defaultValue: V,
  parser?: keyof AbstractParserOptions<any>
): { readonly value: V } & UseStorageMethod<V>;
export function useStorage<V, K = string>(
  key: K,
  defaultValue?: V,
  parser: keyof AbstractParserOptions<any> = 'plain'
): { readonly value: any } & UseStorageMethod<V> {
  const { SERVICE, PARSER } = useStorage;

  const { serializer, deserializer } = isUndefined(parser) ? PARSER.plain : PARSER[parser];

  const store = useStore(key, SERVICE);
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot);

  return useMemo<{ readonly value: any } & UseStorageMethod<V>>(
    () => ({
      get value() {
        if (isNull(value)) {
          return defaultValue ?? null;
        }

        return deserializer(value);
      },
      set: (value) => {
        const originValue = serializer(value);
        SERVICE.setItem(key, originValue);
        store.emitChange();
      },
      remove: () => {
        SERVICE.removeItem(key);
        store.emitChange();
      },
    }),
    [SERVICE, defaultValue, deserializer, key, serializer, store, value]
  );
}

useStorage.SERVICE = new LocalStorageService() as AbstractStorage<any, any>;
useStorage.PARSER = STRING_PARSER as AbstractParserOptions<any>;
useStorage.clear = () => {
  useStorage.SERVICE.clear();
  for (const [, store] of stores) {
    store.emitChange();
  }
};
