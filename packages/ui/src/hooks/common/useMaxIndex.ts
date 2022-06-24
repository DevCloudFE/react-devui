import { useId, useMemo, useRef } from 'react';

import { usePrefixConfig } from '../d-config';
import { useUnmount } from '../lifecycle';

const MAX_INDEX_MANAGER = {
  record: {} as { [index: string]: number },

  getMaxIndex(id: string): number {
    let maxZIndex = 0;
    Object.values(this.record).forEach((num) => {
      maxZIndex = Math.max(maxZIndex, num);
    });
    maxZIndex += 1;
    this.record[id] = maxZIndex;
    return maxZIndex;
  },

  deleteRecord(id: string) {
    delete this.record[id];
  },
};

export function useMaxIndex(condition?: boolean) {
  const dPrefix = usePrefixConfig();

  const prevIndex = useRef<string>();
  const id = useId();

  const zIndex = useMemo(() => {
    MAX_INDEX_MANAGER.deleteRecord(id);

    if (condition) {
      const maxZIndex = MAX_INDEX_MANAGER.getMaxIndex(id);
      return `calc(var(--${dPrefix}zindex-fixed) + ${maxZIndex})`;
    }

    return prevIndex.current;
  }, [condition, dPrefix, id]);
  prevIndex.current = zIndex;

  useUnmount(() => {
    MAX_INDEX_MANAGER.deleteRecord(id);
  });

  return zIndex;
}
