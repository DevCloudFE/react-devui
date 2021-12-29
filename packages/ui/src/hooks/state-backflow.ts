/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useId } from 'react';

export function useStateBackflow<S extends any[]>(
  update?: (identity: string, ...states: S) => void,
  remove?: (identity: string) => void,
  ...states: S
) {
  const identity = useId();

  useEffect(() => {
    update?.(identity, ...states);
    return () => {
      remove?.(identity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, update, remove, ...states]);

  return identity;
}
