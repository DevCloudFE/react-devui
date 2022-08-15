import { useEffect, useRef } from 'react';

export function useUnmount(fn: () => any): void {
  const fnRef = useRef(fn);

  fnRef.current = fn;

  useEffect(() => () => fnRef.current(), []);
}
