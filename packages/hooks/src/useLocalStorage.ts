import { isNull, isUndefined } from 'lodash';
import { useCallback, useEffect } from 'react';

import { useForceUpdate } from './useForceUpdate';

interface parserOptions<T> {
  serializer: (value: T) => string;
  deserializer: (value: string) => T;
}

const PARSER: Record<'default' | 'json' | 'number', parserOptions<any>> = {
  default: {
    serializer: (value: any) => value,
    deserializer: (value: string) => value,
  },
  json: {
    serializer: (value: any) => JSON.stringify(value),
    deserializer: (value: string) => JSON.parse(value),
  },
  number: {
    serializer: (value: any) => String(value),
    deserializer: (value: string) => Number(value),
  },
};

const updates = new Map<string, Set<() => void>>();

export function useLocalStorage<T = string>(key: string, initialValue: T, parser?: 'json' | 'number'): [T, (value: T) => void, () => void] {
  const { serializer, deserializer } = isUndefined(parser) ? PARSER.default : PARSER[parser];

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const cb = forceUpdate;
    const cbs = updates.get(key) ?? new Set();
    cbs.add(cb);
    updates.set(key, cbs);
    return () => {
      cbs.delete(cb);
    };
  }, [forceUpdate, key]);

  const update = useCallback(() => {
    for (const cb of updates.get(key) ?? new Set()) {
      cb();
    }
  }, [key]);

  return [
    (() => {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const val = localStorage.getItem(key);
      if (isNull(val)) {
        localStorage.setItem(key, serializer(initialValue));
        return initialValue;
      }
      return deserializer(val);
    })(),
    useCallback(
      (value) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, serializer(value));
          update();
        }
      },
      [key, serializer, update]
    ),
    useCallback(() => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
        update();
      }
    }, [key, update]),
  ];
}
