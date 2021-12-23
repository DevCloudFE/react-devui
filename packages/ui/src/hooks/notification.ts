/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Subject } from 'rxjs';

export interface NotificationCallback<T = any> {
  bind: (cb: (data: T) => void) => void;
  removeBind: (cb: (data: T) => void) => void;
}

export function useNotification<T = any>() {
  const [notification] = useState(() => new Subject<T>());

  const dataRef = useRef({
    cbs: new Set<(data: T) => void>(),
  });

  useEffect(() => {
    const ob = notification.subscribe({
      next: (data) => {
        for (const cb of dataRef.current.cbs.values()) {
          cb(data);
        }
      },
    });

    return () => {
      ob.unsubscribe();
    };
  }, [notification]);

  const res = useMemo<[Subject<T>, NotificationCallback<T>]>(
    () => [
      notification,
      {
        bind: (cb: (data: T) => void) => {
          dataRef.current.cbs.add(cb);
        },
        removeBind: (cb: (data: T) => void) => {
          dataRef.current.cbs.delete(cb);
        },
      },
    ],
    [notification]
  );

  return res;
}
