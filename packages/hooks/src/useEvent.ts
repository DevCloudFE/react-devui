import type { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';

import { useEffect, useRef } from 'react';
import { fromEvent } from 'rxjs';

export function useEvent<E = Event>(
  target: HasEventTargetAddRemove<E> | null,
  type: keyof HTMLElementEventMap,
  fn: (e: E) => any,
  options?: AddEventListenerOptions
) {
  const dataRef = useRef({
    type,
    fn,
    options,
  });
  dataRef.current = { type, fn, options };

  useEffect(() => {
    if (target) {
      const ob = fromEvent<E>(target, dataRef.current.type, dataRef.current.options as EventListenerOptions).subscribe({
        next: (e) => {
          dataRef.current.fn(e);
        },
      });

      return () => {
        ob.unsubscribe();
      };
    }
  }, [target]);
}
