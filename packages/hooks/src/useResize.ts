import { isUndefined } from 'lodash';
import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

export function useResize(target: React.RefObject<Element | null>, cb?: ResizeObserverCallback, disabled = false, skipEmpty = true): void {
  const dataRef = useRef<{
    prevContentRect?: { width: number; height: number };
  }>({});

  if (disabled) {
    dataRef.current.prevContentRect = undefined;
  }

  useEffect(() => {
    if (target.current && !disabled) {
      const observer = new ResizeObserver((entries, observer) => {
        let entry = entries[0];

        if ('borderBoxSize' in entry) {
          if (
            !isUndefined(dataRef.current.prevContentRect) &&
            !(skipEmpty && entry.borderBoxSize[0].blockSize === 0 && entry.borderBoxSize[0].inlineSize === 0) &&
            (dataRef.current.prevContentRect.width !== entry.borderBoxSize[0].inlineSize ||
              dataRef.current.prevContentRect.height !== entry.borderBoxSize[0].blockSize)
          ) {
            flushSync(() => cb?.(entries, observer));
          }
          dataRef.current.prevContentRect = { width: entry.borderBoxSize[0].inlineSize, height: entry.borderBoxSize[0].blockSize };
        } else {
          entry = entries[0];
          if (
            !isUndefined(dataRef.current.prevContentRect) &&
            !(skipEmpty && entry.contentRect.width === 0 && entry.contentRect.height === 0) &&
            (dataRef.current.prevContentRect.width !== entry.contentRect.width ||
              dataRef.current.prevContentRect.height !== entry.contentRect.height)
          ) {
            flushSync(() => cb?.(entries, observer));
          }
          dataRef.current.prevContentRect = { width: entry.contentRect.width, height: entry.contentRect.height };
        }
      });
      observer.observe(target.current);
      return () => {
        observer.disconnect();
      };
    }
  });
}
