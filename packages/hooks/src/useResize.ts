import { useEffect } from 'react';
import { flushSync } from 'react-dom';

import { useEventCallback } from './useEventCallback';

export function useResize(target: HTMLElement | null, fn: () => any) {
  const handleResize = useEventCallback(fn);

  useEffect(() => {
    if (target) {
      let isFirst = true;
      const observer = new ResizeObserver(() => {
        if (isFirst) {
          isFirst = false;
        } else {
          flushSync(() => handleResize());
        }
      });
      observer.observe(target);

      return () => {
        observer.disconnect();
      };
    }
  }, [handleResize, target]);
}
