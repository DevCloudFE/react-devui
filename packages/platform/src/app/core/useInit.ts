import type { UserState, NotificationItem } from './state';

import { useHttp } from './http';
import { useUserState, useNotificationState } from './state';
import { useRefreshToken } from './token';
import { useACL } from './useACL';
import { useMenu } from './useMenu';

export function useInit() {
  const http = useHttp();
  const acl = useACL();

  const refreshToken = useRefreshToken();

  const handleUser = (user: UserState) => {
    useUserState.setState(user);

    //#region ACL
    acl.setFull(user.role === 'admin');
    acl.set(user.permission);
    //#endregion
  };

  const getNotification = () => {
    useNotificationState.setState(undefined);
    http<NotificationItem[]>(
      {
        url: '/notification',
        method: 'get',
      },
      { unmount: false }
    ).subscribe({
      next: (res) => {
        useNotificationState.setState(res);
      },
    });
  };

  const resetMenu = () => {
    useMenu.setState((draft) => {
      draft.expands = undefined;
    });
  };

  return (user: UserState) => {
    refreshToken();
    handleUser(user);
    getNotification();
    resetMenu();
  };
}
