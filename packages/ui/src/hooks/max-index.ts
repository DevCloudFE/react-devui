import { useEffect, useState } from 'react';

const MAX_INDEX_MANAGER = {
  record: new Map<symbol, number>(),

  getMaxIndex(): [symbol, number] {
    const key = Symbol();
    let maxZIndex = 1000;
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
  const [zIndex, setZIndex] = useState(1000);

  useEffect(() => {
    if (getIndex) {
      const [key, maxZIndex] = MAX_INDEX_MANAGER.getMaxIndex();
      setZIndex(maxZIndex);
      return () => {
        MAX_INDEX_MANAGER.deleteRecord(key);
      };
    }
  }, [getIndex]);

  return zIndex;
}
