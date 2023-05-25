import type { AppNotification, AppUser } from './store';

import { ROLE_ACL } from '../config/acl';
import { useHttp } from './http';
import { GlobalStore } from './store';
import { useRefreshToken } from './token';
import { useACL } from './useACL';

export function useInit() {
  const http = useHttp();
  const acl = useACL();

  const refreshToken = useRefreshToken();

  const handleUser = (user: AppUser) => {
    GlobalStore.set('appUser', user);

    //#region ACL
    acl.setFull(user.permission.includes(ROLE_ACL.super_admin));
    acl.set(user.permission);
    //#endregion
  };

  const getNotification = () => {
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
  };

  const resetMenu = () => {
    GlobalStore.set('appMenu', (draft) => {
      draft.expands = undefined;
    });
  };

  return (user: AppUser) => {
    refreshToken();
    handleUser(user);
    getNotification();
    resetMenu();
  };
}
