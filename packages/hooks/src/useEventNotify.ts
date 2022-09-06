import { useEffect, useId } from 'react';

export const EVENTS = new Map<string, Set<(...args: any[]) => void>>();
export function useEventNotify<T extends any[]>() {
  const id = useId();

  useEffect(() => {
    EVENTS.set(id, new Set());
    return () => {
      EVENTS.delete(id);
    };
  }, [id]);

  return [
    id,
    (...args: T) => {
      for (const cb of EVENTS.get(id)!) {
        cb(...args);
      }
    },
  ] as const;
}
