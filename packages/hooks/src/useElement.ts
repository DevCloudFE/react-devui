import { isString } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { SSR_ENV } from '@react-devui/utils';

export type DElementSelector = string | (() => HTMLElement | null);

export function useElement(selector: DElementSelector): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(() => {
    if (SSR_ENV) {
      return null;
    } else {
      return isString(selector) ? (document.querySelector(selector) as HTMLElement | null) : selector();
    }
  });

  const prevEl = useRef(el);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let el = prevEl.current;

    if (isString(selector)) {
      el = document.querySelector(selector) as HTMLElement | null;
    } else {
      el = selector();
    }

    if (el !== prevEl.current) {
      prevEl.current = el;
      setEl(el);
    }
  });

  return el;
}
