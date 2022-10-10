import { isString, isUndefined } from 'lodash';
import { useRef, useState } from 'react';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type DRefExtra<T = HTMLElement> = (() => T | null) | string;

export function useRefExtra(refExtra?: string, update?: boolean): React.RefObject<HTMLElement>;
export function useRefExtra<T = HTMLElement>(refExtra?: () => T | null, update?: boolean): React.RefObject<T>;
export function useRefExtra<T = HTMLElement>(refExtra?: DRefExtra<T>, update?: boolean): React.RefObject<T | HTMLElement>;
export function useRefExtra(refExtra?: DRefExtra<any>, update?: boolean): React.RefObject<any> {
  const [, setInstance] = useState<any>(null);
  const ref = useRef<any>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsomorphicLayoutEffect(() => {
    if (!isUndefined(refExtra)) {
      ref.current = isString(refExtra) ? document.querySelector(refExtra) : refExtra();
    }

    if (update) {
      setInstance(ref.current);
    }
  });

  return ref;
}
