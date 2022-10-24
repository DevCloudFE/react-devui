import type { MenuItem } from '../config/menu';
import type { UserState, NotificationItem } from './state';

import { isObject } from 'lodash';

import { MENU } from '../config/menu';
import { useHttp } from './http';
import { useUserState, useNotificationState } from './state';
import { useRefreshToken } from './token';
import { useACL } from './useACL';
import { useMenu } from './useMenu';

export function useInit() {
  const http = useHttp();
  const acl = useACL();

  const [, setUser] = useUserState();
  const [, setNotification] = useNotificationState();

  const [, setMenu] = useMenu();

  const refreshToken = useRefreshToken();

  const handleUser = (user: UserState) => {
    setUser(user);

    //#region ACL
    acl.setFull(user.role === 'admin');
    acl.set(user.permission);
    //#endregion

    //#region Menu
    const reduceMenu = (arr: MenuItem[], parentSub: string[] = []): string[] | undefined => {
      for (const item of arr) {
        if (item.acl) {
          const params =
            isObject(item.acl) && 'control' in item.acl
              ? item.acl
              : {
                  control: item.acl,
                };
          if (!acl.can(params.control, params.mode)) {
            continue;
          }
        }

        if (!item.disabled) {
          if (item.type === 'sub') {
            const expands = reduceMenu(item.children!, parentSub.concat([item.path]));
            if (expands) {
              return expands;
            }
          } else {
            return parentSub;
          }
        }
      }
    };
    setMenu((draft) => {
      draft.expands = reduceMenu(MENU) ?? [];
    });
    //#endregion
  };

  const getNotification = () => {
    setNotification(undefined);
    const [notificationReq] = http<NotificationItem[]>(
      {
        url: '/notification',
        method: 'get',
      },
      { unmount: false }
    );
    notificationReq.subscribe({
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
