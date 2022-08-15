import { useEffect } from 'react';

export function useMount(fn: () => any) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fn(), []);
}
