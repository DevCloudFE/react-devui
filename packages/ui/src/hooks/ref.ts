import { useCallback, useMemo, useState } from 'react';

export function useRefCallback<T = HTMLElement>() {
  const [el, setEl] = useState<T | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      setEl(node);
    },
    [setEl]
  );

  const res = useMemo<[T | null, React.RefCallback<T>]>(() => [el, ref], [el, ref]);

  return res;
}
