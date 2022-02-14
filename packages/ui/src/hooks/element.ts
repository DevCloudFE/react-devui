/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isString } from 'lodash';
import { useRef, useState } from 'react';

import { useIsomorphicLayoutEffect } from './layout-effect';

export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);

export function useElement(selector: DElementSelector): HTMLElement | null;
export function useElement(selector: any, handle: () => HTMLElement | null): HTMLElement | null;
export function useElement(selector: any, handle?: any): any {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const prevEl = useRef(el);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsomorphicLayoutEffect(() => {
    let el = prevEl.current;
    if (isString(selector)) {
      el = document.querySelector(selector) as HTMLElement | null;
    } else if (isFunction(selector)) {
      el = selector();
    } else if (selector instanceof Element || selector === null) {
      el = selector;
    } else if (handle) {
      el = handle();
    }

    if (el !== prevEl.current) {
      prevEl.current = el;
      setEl(el);
    }
  });

  return el;
}
