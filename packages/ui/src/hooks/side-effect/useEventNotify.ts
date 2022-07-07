import { useState } from 'react';
import { Subject } from 'rxjs';

export function useEventNotify<T>() {
  const [event$] = useState(() => new Subject<T>());

  return event$;
}
