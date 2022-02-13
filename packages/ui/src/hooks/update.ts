/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react';

export function useForceUpdate() {
  const [, setN] = useState(0);

  return useCallback(() => {
    setN((n) => n + 1);
  }, []);
}
