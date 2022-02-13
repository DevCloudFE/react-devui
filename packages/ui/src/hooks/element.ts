/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isString } from 'lodash';
import { useRef, useState } from 'react';

import { useIsomorphicLayoutEffect } from './layout-effect';

export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);

type SelectorHandle = () => HTMLElement | null;

export function useElement(selector: DElementSelector): HTMLElement | null;
export function useElement(selector: any, handle: SelectorHandle): HTMLElement | null;
export function useElement(selector: any, handle?: SelectorHandle): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const preEl = useRef(el);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsomorphicLayoutEffect(() => {
    let el = preEl.current;
    if (isString(selector)) {
      el = document.querySelector(selector) as HTMLElement | null;
    } else if (isFunction(selector)) {
      el = selector();
    } else if (selector instanceof Element || selector === null) {
      el = selector;
    } else if (handle) {
      el = handle();
    }

    if (el !== preEl.current) {
      preEl.current = el;
      setEl(el);
    }
  });

  return el;
}
