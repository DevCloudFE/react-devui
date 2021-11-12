import { useCallback } from 'react';
import { useImmer } from 'use-immer';

export function useCustomRef<T>(): [T | null, React.RefCallback<T>] {
  const [el, setEl] = useImmer<T | null>(null);
  const ref = useCallback(
    (node: T | null) => {
      setEl(node);
    },
    [setEl]
  );

  return [el, ref];
}
