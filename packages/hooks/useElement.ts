import { isString } from 'lodash';
import { useMemo, useRef } from 'react';

import { SSR_ENV } from '@react-devui/utils';

import { useForceUpdate } from './useForceUpdate';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type DElementSelector = string | (() => HTMLElement | null);

export function useElement(selector: DElementSelector): HTMLElement | null {
  const rendered = useRef(false);
  const getEl = () => (isString(selector) ? (document.querySelector(selector) as HTMLElement | null) : selector());

  const initEl = useMemo(() => {
    if (SSR_ENV) {
      return null;
    } else {
      return getEl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const forceUpdate = useForceUpdate();
  useIsomorphicLayoutEffect(() => {
    rendered.current = true;

    if (getEl() !== initEl) {
      forceUpdate();
    }
  }, []);

  return rendered.current ? getEl() : initEl;
}
