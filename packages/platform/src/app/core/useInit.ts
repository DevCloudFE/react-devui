import type { AppNotification, AppUser } from '../utils/types';

import { isNull } from 'lodash';

import { useACL } from '@react-devui/hooks';

import { ROLE_ACL } from '../config/acl';
import { useHttp } from './http';
import { GlobalStore } from './store';
import { TOKEN, TOKEN_REFRESH, TOKEN_REFRESH_OFFSET } from './token';

let CLEAR_TOKEN_REFRESH: (() => void) | undefined;

export function useInit() {
  const http = useHttp();
  const acl = useACL();

  return (user: AppUser) => {
    acl.set([]);
    acl.setFull(user.permission.includes(ROLE_ACL.super_admin));
    acl.add(user.permission);

    GlobalStore.set('appUser', user);

    GlobalStore.set('appMenu', (draft) => {
      draft.expands = undefined;
    });

    GlobalStore.set('appNotifications', undefined);
    http<AppNotification[]>(
      {
        url: '/notification',
        method: 'get',
      },
      { unmount: false }
    ).subscribe({
      next: (res) => {
        GlobalStore.set('appNotifications', res);
      },
    });

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
