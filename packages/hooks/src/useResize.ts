import { isUndefined } from 'lodash';
import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

export function useResize(target: React.RefObject<Element | null>, cb?: ResizeObserverCallback, disabled = false, skipEmpty = true): void {
  const dataRef = useRef<{
    prevBorderBoxSize?: ResizeObserverSize;
  }>({});

  if (disabled) {
    dataRef.current.prevBorderBoxSize = undefined;
  }

  useEffect(() => {
    if (target.current && !disabled) {
      const observer = new ResizeObserver((entries, observer) => {
        if (
          !isUndefined(dataRef.current.prevBorderBoxSize) &&
          !(skipEmpty && entries[0].borderBoxSize[0].blockSize === 0 && entries[0].borderBoxSize[0].inlineSize === 0) &&
          (dataRef.current.prevBorderBoxSize.blockSize !== entries[0].borderBoxSize[0].blockSize ||
            dataRef.current.prevBorderBoxSize.inlineSize !== entries[0].borderBoxSize[0].inlineSize)
        ) {
          flushSync(() => cb?.(entries, observer));
        }
        dataRef.current.prevBorderBoxSize = entries[0].borderBoxSize[0];
      });
      observer.observe(target.current);
      return () => {
        observer.disconnect();
      };
    }
  });
}
