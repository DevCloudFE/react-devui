import { useCallback } from 'react';

import { useImmer } from './immer';

export function useRefCallback<T = HTMLElement>(): [T | null, React.RefCallback<T>] {
  const [el, setEl] = useImmer<T | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      setEl(node);
    },
    [setEl]
  );

  return [el, ref];
}
