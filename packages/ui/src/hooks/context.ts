/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNull, isUndefined } from 'lodash';
import { useContext, useMemo } from 'react';

export function useContextOptional<T>(Context: React.Context<T>): Partial<Exclude<T, null | undefined>> & { __context_exist: boolean } {
  const context = useContext(Context);

  const proxy = useMemo<any>(() => {
    const handler: ProxyHandler<any> = {
      get: function (...args) {
        if (args[1] === '__context_exist') {
          return true;
        }
        return Reflect.get(...args);
      },
    };

    return isNull(context) || isUndefined(context) ? { __context_exist: false } : new Proxy(context, handler);
  }, [context]);

  return proxy;
}

export function useContextRequired<T>(Context: React.Context<T>): NonNullable<T> {
  const context = useContext<any>(Context);

  if (isNull(context) || isUndefined(context)) {
    throw new Error('Context is required!');
  }

  return context;
}
