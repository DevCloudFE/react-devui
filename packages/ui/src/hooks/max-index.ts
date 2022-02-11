import { useEffect, useMemo, useRef } from 'react';

import { usePrefixConfig } from './d-config';

const MAX_INDEX_MANAGER = {
  record: new Map<symbol, number>(),

  getMaxIndex(): [symbol, number] {
    const key = Symbol();
    let maxZIndex = 0;
    for (const num of this.record.values()) {
      maxZIndex = Math.max(maxZIndex, num);
    }
    maxZIndex += 1;
    this.record.set(key, maxZIndex);
    return [key, maxZIndex];
  },

  deleteRecord(key?: symbol) {
    key && this.record.delete(key);
  },
};

export function useMaxIndex(getIndex: boolean) {
  const dPrefix = usePrefixConfig();

  const dataRef = useRef<{
    key?: symbol;
  }>({});

  const zIndex = useMemo(() => {
    MAX_INDEX_MANAGER.deleteRecord(dataRef.current.key);

    if (getIndex) {
      const [key, maxZIndex] = MAX_INDEX_MANAGER.getMaxIndex();
      dataRef.current.key = key;
      return `calc(var(--${dPrefix}zindex-fixed) + ${maxZIndex})`;
    }

    return `var(--${dPrefix}zindex-fixed)`;
  }, [dPrefix, getIndex]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      MAX_INDEX_MANAGER.deleteRecord(dataRef.current.key);
    };
  }, []);

  return zIndex;
}
