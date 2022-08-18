import { useMemo } from 'react';
import { Subject } from 'rxjs';

export function useEventNotify<T>() {
  const event$ = useMemo(() => new Subject<T>(), []);

  return event$;
}
