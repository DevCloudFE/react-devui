import { useState } from 'react';

import { useEventCallback } from './useEventCallback';

export function useRefCallback<T = HTMLElement>(): [T | null, React.RefCallback<T>] {
  const [instance, setInstance] = useState<T | null>(null);

  return [
    instance,
    useEventCallback((instance: T) => {
      setInstance(instance);
    }),
  ];
}
