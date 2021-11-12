/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useMemo } from 'react';

export function useCustomContext<T>(Context: React.Context<T>): Partial<Exclude<T, null>> {
  const context = useContext(Context);

  const proxy = useMemo(() => {
    const handler: ProxyHandler<any> = {
      get: function (...args) {
        if (context === null) {
          return undefined;
        }
        return Reflect.get(...args);
      },
    };

    return new Proxy(context ?? {}, handler);
  }, [context]);

  return proxy;
}
