import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import axios from 'axios';
import { isNull } from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { catchError, EMPTY, from, map, Subject, takeUntil, throwError } from 'rxjs';

import { useEventCallback, useUnmount } from '@react-devui/hooks';
import { ToastService } from '@react-devui/ui';

import '../config/mock';
import { LOGIN_PATH, PREV_ROUTE_KEY } from '../config/other';
import { TOKEN } from '../config/token';
import { environment } from '../environments';

export function useHttp() {
  const dataRef = useRef<{
    abortFns: Set<() => void>;
  }>({
    abortFns: new Set(),
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useUnmount(() => {
    for (const abort of dataRef.current.abortFns) {
      abort();
    }
  });

  return useEventCallback((options?: { unmount?: boolean }) => {
    const { unmount = true } = options ?? {};

    const onDestroy$ = new Subject<void>();
    const controller = new AbortController();
    const abort = () => {
      onDestroy$.next();
      onDestroy$.complete();
      controller.abort();
    };
    if (unmount) {
      dataRef.current.abortFns.add(abort);
    }

    return [
      <T = any, D = any>(config: AxiosRequestConfig<D>) => {
        const headers = { ...config.headers };
        if (!isNull(TOKEN.value)) {
          headers['Authorization'] = `Bearer ${TOKEN.value}`;
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
              switch (error.response.status) {
                case 401:
                  ToastService.open({
                    dContent: t('User not authorized'),
                    dType: 'error',
                  });
                  navigate(LOGIN_PATH, { state: { [PREV_ROUTE_KEY]: location } });
                  return EMPTY;

                case 403:
                case 404:
                case 500:
                  navigate(`/exception/${error.response.status}`);
                  return EMPTY;

                default:
                  break;
              }
            } else if (error.request) {
              // The request was made but no response was received.
            } else {
              // Something happened in setting up the request that triggered an Error.
            }
            return throwError(() => error);
          }),
          map((res) => res.data)
        );
      },
      abort,
    ] as const;
  });
}
