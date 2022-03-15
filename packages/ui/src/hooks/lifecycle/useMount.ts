import { useEffect } from 'react';

export function useMount(fn: () => void) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fn(), []);
}
