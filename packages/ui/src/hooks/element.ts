/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isString } from 'lodash';
import { useState } from 'react';

import { useIsomorphicLayoutEffect } from './layout-effect';

export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);

type SelectorHandle = () => HTMLElement | null;

export function useElement(selector: DElementSelector): HTMLElement | null;
export function useElement(selector: any, handle: SelectorHandle): HTMLElement | null;
export function useElement(selector: any, handle?: SelectorHandle): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (isString(selector)) {
      const el = document.querySelector(selector) as HTMLElement | null;
      setEl(el);
    } else if (isFunction(selector)) {
      setEl(selector());
    } else if (selector instanceof Element || selector === null) {
      setEl(selector);
    } else {
      setEl(handle?.() ?? null);
    }
  }, [handle, selector]);

  return el;
}
