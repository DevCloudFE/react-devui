import { useCallback, useState } from 'react';

export function useRefCallback<T = HTMLElement>(): [T | null, React.RefCallback<T>] {
  const [el, setEl] = useState<T | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      setEl(node);
    },
    [setEl]
  );

  return [el, ref];
}
