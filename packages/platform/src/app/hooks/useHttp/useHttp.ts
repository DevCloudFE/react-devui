import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import axios from 'axios';
import { isNull } from 'lodash';
import { useCallback, useRef } from 'react';
import { catchError, map, throwError } from 'rxjs';
import { from } from 'rxjs';
import { Subject, takeUntil } from 'rxjs';

import { useUnmount } from '@react-devui/hooks';

import { TOKEN } from '../../../config/token';
import { environment } from '../../../environments';
import './mock';

export function useHttp() {
  const abortFns = useRef(new Set<() => void>());

  useUnmount(() => {
    for (const abort of abortFns.current) {
      abort();
    }
  });

  return useCallback((options?: { unmount?: boolean }) => {
    const { unmount = true } = options ?? {};

    const onDestroy$ = new Subject<void>();
    const controller = new AbortController();
    const abort = () => {
      onDestroy$.next();
      onDestroy$.complete();
      controller.abort();
    };
    if (unmount) {
      abortFns.current.add(abort);
    }

    return [
      <T = any, D = any>(config: AxiosRequestConfig<D>) => {
        const token = TOKEN.token;
        const headers = { ...config.headers };
        if (!isNull(token)) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        return from(
          axios({
            ...config,
            baseURL: environment.baseURL,
            headers,
            signal: controller.signal,
          }) as Promise<AxiosResponse<T, D>>
        ).pipe(
          takeUntil(onDestroy$),
          catchError((error: AxiosError<T, D>) => {
            if (error.response) {
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
            } else if (error.request) {
              console.log(error.request);
            } else {
              console.error(error);
            }
            return throwError(() => error);
          }),
          map((res) => res.data)
        );
      },
      abort,
    ] as const;
  }, []);
}
