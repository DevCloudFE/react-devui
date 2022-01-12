import { useEffect, useState } from 'react';

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

  deleteRecord(key: symbol | null) {
    key && this.record.delete(key);
  },
};

export function useMaxIndex(getIndex: boolean) {
  const dPrefix = usePrefixConfig();
  const [zIndex, setZIndex] = useState(`var(--${dPrefix}zindex-fixed)`);

  useEffect(() => {
    if (getIndex) {
      const [key, maxZIndex] = MAX_INDEX_MANAGER.getMaxIndex();
      setZIndex(`calc(var(--${dPrefix}zindex-fixed) + ${maxZIndex})`);
      return () => {
        MAX_INDEX_MANAGER.deleteRecord(key);
      };
    }
  }, [dPrefix, getIndex]);

  return zIndex;
}
