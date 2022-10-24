// https://cloud.google.com/apis/design

import { useEventCallback } from '@react-devui/hooks';

import { useHttp } from '../../core';

export interface StandardFields {
  create_time: number;
  update_time: number;
}

export interface ErrorStandardFields {
  error: {
    code: string;
    message: string;
  };
}

export function useAPI(url: string) {
  const http = useHttp();

  return {
    list: useEventCallback(<T extends StandardFields = any, D = any>(data?: D) =>
      http<T[], D>({
        url,
        method: 'get',
        data,
      })
    ),
    get: useEventCallback(<T extends StandardFields = any, D = any>(id: number, data?: D) =>
      http<T, D>({
        url: `${url}/${id}`,
        method: 'get',
        data,
      })
    ),
    create: useEventCallback(<T extends StandardFields = any, D = any>(data: D) =>
      http<T, D>({
        url,
        method: 'post',
        data,
      })
    ),
    update: useEventCallback(<T extends StandardFields = any, D = any>(id: number, data: D) =>
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
