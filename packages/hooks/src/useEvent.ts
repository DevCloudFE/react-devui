import type { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';

import { useEffect } from 'react';
import { fromEvent } from 'rxjs';

export function useEvent<E = Event>(
  target: React.RefObject<HasEventTargetAddRemove<E> | null>,
  type: keyof HTMLElementEventMap,
  fn?: (e: E) => void,
  options?: AddEventListenerOptions,
  disabled = false
) {
  useEffect(() => {
    if (target.current && !disabled) {
      const ob = fromEvent<E>(target.current, type, options as EventListenerOptions).subscribe({
        next: (e) => {
          fn?.(e);
        },
      });

      return () => {
        ob.unsubscribe();
      };
    }
  });
}
