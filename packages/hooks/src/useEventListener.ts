import { useEffect } from 'react';

import { EVENTS } from './useEventNotify';

export function useEventListener(id: string, cb: (...args: any[]) => void) {
  useEffect(() => {
    EVENTS.get(id)?.add(cb);
    return () => {
      EVENTS.get(id)?.delete(cb);
    };
  });
}
