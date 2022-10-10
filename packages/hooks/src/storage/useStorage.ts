import type { AbstractParserOptions } from './parser';
import type { AbstractStorage } from './storage';

import { isNull, isUndefined } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import { LocalStorageService } from './localStorage';
import { STRING_PARSER } from './parser';

const updates = new Map<any, Set<(...args: any[]) => any>>();

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

  const res = useMemo<{ readonly value: any } & UseStorageMethod<V>>(() => {
    const updateKey = (ov: any) => {
      const cbs = updates.get(key);
      if (cbs) {
        for (const cb of cbs) {
          cb(ov);
        }
      }
    };
    return {
      get value() {
        const originValue = SERVICE.getItem(key);
        if (isNull(originValue)) {
          return defaultValue ?? null;
        }

        return deserializer(originValue);
      },
      set: (value) => {
        const originValue = serializer(value);
        SERVICE.setItem(key, originValue);
        updateKey(originValue);
      },
      remove: () => {
        SERVICE.removeItem(key);
        updateKey(null);
      },
    };
  }, [SERVICE, defaultValue, deserializer, key, serializer]);
  const [, setOriginValue] = useState(SERVICE.getItem(key));

  const updatesOfKey = updates.get(key);
  if (isUndefined(updatesOfKey)) {
    updates.set(key, new Set([setOriginValue]));
  } else if (!updatesOfKey.has(setOriginValue)) {
    updatesOfKey.add(setOriginValue);
  }

  useEffect(() => {
    updates.get(key)?.delete(setOriginValue);
  }, [key]);

  return res;
}

useStorage.SERVICE = new LocalStorageService() as AbstractStorage<any, any>;
useStorage.PARSER = STRING_PARSER as AbstractParserOptions<any>;
useStorage.clear = () => {
  useStorage.SERVICE.clear();
  for (const [, cbs] of updates) {
    for (const cb of cbs) {
      cb(null);
    }
  }
};
