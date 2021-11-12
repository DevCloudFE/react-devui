/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isString } from 'lodash';
import { useMemo } from 'react';

export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);

type SelectorHandle = () => HTMLElement | null;

export function useElement(selector: DElementSelector): { current: HTMLElement | null };
export function useElement(selector: any, handle: SelectorHandle): { current: HTMLElement | null };
export function useElement(selector: any, handle?: SelectorHandle): { current: HTMLElement | null } {
  const proxy = useMemo(() => {
    const handler: ProxyHandler<any> = {
      get: function (target: any, key: string | symbol, receiver: any) {
        if (key === 'current') {
          if (isString(selector)) {
            const el = document.querySelector(selector) as HTMLElement | null;
            return el;
          } else if (isFunction(selector)) {
            return selector();
          } else if (selector instanceof HTMLElement || selector === null) {
            return selector;
          } else {
            return handle?.();
          }
        }
        return Reflect.get(target, key, receiver);
      },
    };

    return new Proxy({}, handler);
  }, [selector, handle]);

  return proxy;
}
