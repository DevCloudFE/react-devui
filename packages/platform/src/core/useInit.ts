import type { NotificationItem, UserState } from '../config/state';

import { isNull } from 'lodash';

import { useNotificationState } from '../config/state';
import { useUserState } from '../config/state';
import { TOKEN, TOKEN_REFRESH, TOKEN_REFRESH_OFFSET } from '../config/token';
import { useACL } from './useACL';
import { useHttp } from './useHttp';

let CLEAR_TOKEN_REFRESH: (() => void) | undefined;

export function useInit() {
  const createHttp = useHttp();
  const acl = useACL();

  const [, setUser] = useUserState();
  const [, setNotification] = useNotificationState();

  const refreshToken = () => {
    CLEAR_TOKEN_REFRESH?.();
    if (TOKEN_REFRESH) {
      const refresh = () => {
        const expiration = TOKEN.expiration;
        if (!isNull(expiration)) {
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

  const handleUser = (user: UserState) => {
    setUser(user);

    //#region ACL
    acl.setFull(user.role === 'admin');
    acl.set(user.permission);
    //#endregion
  };

  const getNotification = () => {
    setNotification(undefined);
    const [http] = createHttp({ unmount: false });
    http<NotificationItem[]>({
      url: '/api/notification',
      method: 'get',
    }).subscribe({
      next: (res) => {
        setNotification(res);
      },
    });
  };

  return (user: UserState) => {
    refreshToken();
    handleUser(user);
    getNotification();
  };
}
