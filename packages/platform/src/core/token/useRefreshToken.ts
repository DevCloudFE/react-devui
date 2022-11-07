import { isNull } from 'lodash';

import { useHttp } from '../http';
import { TOKEN_REFRESH, TOKEN, TOKEN_REFRESH_OFFSET } from './token';

let CLEAR_TOKEN_REFRESH: (() => void) | undefined;

export function useRefreshToken() {
  const http = useHttp();

  return () => {
    CLEAR_TOKEN_REFRESH?.();
    if (TOKEN_REFRESH) {
      const refresh = () => {
        const expiration = TOKEN.expiration;
        if (!isNull(expiration) && !TOKEN.expired) {
          const tid = window.setTimeout(() => {
            const refreshTokenReq = http<string>(
              {
                url: '/auth/refresh',
                method: 'post',
              },
              { unmount: false }
            );
            refreshTokenReq.subscribe({
              next: (res) => {
                TOKEN.set(res);
                refresh();
              },
            });
            CLEAR_TOKEN_REFRESH = () => {
              refreshTokenReq.abort();
            };
          }, expiration - Date.now() - TOKEN_REFRESH_OFFSET);
          CLEAR_TOKEN_REFRESH = () => {
            clearTimeout(tid);
          };
        }
      };
      refresh();
    }
  };
}
