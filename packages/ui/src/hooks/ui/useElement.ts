import { isNull, isString } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { SSR_ENV } from '../../utils';

export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);

export function useElement(selector: DElementSelector): HTMLElement | null {
  const isElement = selector instanceof HTMLElement || isNull(selector);

  const [el, setEl] = useState<HTMLElement | null>(() => {
    if (isElement) {
      return selector;
    }

    if (SSR_ENV) {
      return null;
    } else {
      return isString(selector) ? (document.querySelector(selector) as HTMLElement | null) : selector();
    }
  });

  const prevEl = useRef(el);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isElement) {
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
    }
  });

  return isElement ? selector : el;
}
