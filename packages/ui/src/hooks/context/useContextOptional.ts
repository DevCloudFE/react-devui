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
