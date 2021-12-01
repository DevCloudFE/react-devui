/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isString } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);

type SelectorHandle = () => HTMLElement | null;

export function useRefSelector(selector: DElementSelector): React.RefObject<HTMLElement>;
export function useRefSelector(selector: any, handle: SelectorHandle): React.RefObject<HTMLElement>;
export function useRefSelector(selector: any, handle?: SelectorHandle): React.RefObject<HTMLElement> {
  const [updateProxy, setUpdateProxy] = useState({
    hasEl: false,
  });

  const proxy = useMemo(() => {
    updateProxy.hasEl = false;

    const handler: ProxyHandler<any> = {
      get: function (target: any, key: string | symbol, receiver: any) {
        if (key === 'current') {
          if (isString(selector)) {
            const el = document.querySelector(selector) as HTMLElement | null;
            return el;
          } else if (isFunction(selector)) {
            return selector();
          } else if (selector instanceof Element || selector === null) {
            return selector;
          } else {
            return handle?.();
          }
        }
        return Reflect.get(target, key, receiver);
      },
    };

    return new Proxy({}, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, handle]);

  useEffect(() => {
    if (proxy.current !== null && !updateProxy.hasEl) {
      setUpdateProxy({ hasEl: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxy]);

  return proxy;
}
