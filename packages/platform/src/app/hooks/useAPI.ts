// https://cloud.google.com/apis/design
import type { useHttp } from '../core';

import { useEventCallback } from '@react-devui/hooks';

interface StandardListRes<T> {
  resources: T[];
  metadata: {
    page: number;
    page_size: number;
    total_size: number;
  };
}

export function useAPI(http: ReturnType<typeof useHttp>, url: string) {
  return {
    list: useEventCallback(<T = any, P = any>(params?: P) =>
      http<StandardListRes<T>>({
        url,
        method: 'get',
        params,
      })
    ),
    get: useEventCallback(<T = any, P = any>(id: number, params?: P) =>
      http<T>({
        url: `${url}/${id}`,
        method: 'get',
        params,
      })
    ),
    create: useEventCallback(<T = any, D = any>(data: D) =>
      http<T, D>({
        url,
        method: 'post',
        data,
      })
    ),
    update: useEventCallback(<T = any, D = any>(id: number, data: D) =>
      http<T, D>({
        url: `${url}/${id}`,
        method: 'put',
        data,
      })
    ),
    delete: useEventCallback((id: number) =>
      http<Record<string, never>>({
        url: `${url}/${id}`,
        method: 'delete',
      })
    ),
  };
}
