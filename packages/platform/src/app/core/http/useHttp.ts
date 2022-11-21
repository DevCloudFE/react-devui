import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { Observable } from 'rxjs';

import axios from 'axios';
import { isNull } from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { concatMap, of } from 'rxjs';
import { catchError, EMPTY, from, map, Subject, takeUntil, throwError } from 'rxjs';

import { useEventCallback, useUnmount } from '@react-devui/hooks';

import { environment } from '../../../environments';
import { LOGIN_PATH, PREV_ROUTE_KEY } from '../../config/other';
import { getGlobalKey } from '../../utils/vars';
import { useToasts } from '../state';
import { TOKEN } from '../token';
import './mock';

export function useHttp() {
  const dataRef = useRef<{
    abortFns: Set<() => void>;
  }>({
    abortFns: new Set(),
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [, setToasts] = useToasts();

  useUnmount(() => {
    for (const abort of dataRef.current.abortFns) {
      abort();
    }
  });

  return useEventCallback(
    <T = any, D = any>(config: AxiosRequestConfig<D>, options?: { unmount?: boolean }): Observable<T> & { abort: () => void } => {
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

      const headers = { ...config.headers };
      if (!isNull(TOKEN.value)) {
        headers['Authorization'] = `Bearer ${TOKEN.value}`;
      }

      const req = of({
        ...config,
        baseURL: environment.http.baseURL,
        url: environment.http.transformURL(config.url!),
        headers,
        signal: controller.signal,
      }).pipe(
        concatMap((req) =>
          from(axios(req) as Promise<AxiosResponse<T, D>>).pipe(
            takeUntil(onDestroy$),
            catchError((error: AxiosError<T, D>) => {
              if (error.response) {
                switch (error.response.status) {
                  case 401:
                    setToasts((draft) => {
                      const key = getGlobalKey();
                      draft.push({
                        key,
                        children: t('User not authorized'),
                        dVisible: true,
                        dType: 'error',
                        onClose: () => {
                          setToasts((draft) => {
                            draft.find((n) => n.key === key)!.dVisible = false;
                          });
                        },
                      });
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
          )
        )
      );
      req['abort'] = abort;

      return req as any;
    }
  );
}
