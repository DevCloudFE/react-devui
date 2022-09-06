import { isString } from 'lodash';

import { useForceUpdate } from './useForceUpdate';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type DElementSelector = string | (() => HTMLElement | null);

export function useElement(selector: DElementSelector): HTMLElement | null {
  const getEl = () => (isString(selector) ? (document.querySelector(selector) as HTMLElement | null) : selector());
  const el = typeof window === 'undefined' ? null : getEl();

  const forceUpdate = useForceUpdate();
  useIsomorphicLayoutEffect(() => {
    if (getEl() !== el) {
      forceUpdate();
    }
  }, []);

  return el;
}
