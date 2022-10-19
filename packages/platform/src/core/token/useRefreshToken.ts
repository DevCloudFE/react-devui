import { isNull } from 'lodash';

import { useHttp } from '../http';
import { TOKEN_REFRESH, TOKEN, TOKEN_REFRESH_OFFSET } from './token';

let CLEAR_TOKEN_REFRESH: (() => void) | undefined;

export function useRefreshToken() {
  const createHttp = useHttp();

  return () => {
    CLEAR_TOKEN_REFRESH?.();
    if (TOKEN_REFRESH) {
      const refresh = () => {
        const expiration = TOKEN.expiration;
        if (!isNull(expiration) && !TOKEN.expired) {
          const [http, abort] = createHttp({ unmount: false });
          const tid = window.setTimeout(() => {
            http<string>({
              url: '/api/auth/refresh',
              method: 'post',
            }).subscribe({
              next: (res) => {
                TOKEN.set(res);
                refresh();
              },
            });
          }, expiration - Date.now() - TOKEN_REFRESH_OFFSET);
          CLEAR_TOKEN_REFRESH = () => {
            clearTimeout(tid);
            abort();
          };
        }
      };
      refresh();
    }
  };
}
