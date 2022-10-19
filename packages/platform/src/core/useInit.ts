import type { UserState, NotificationItem } from './state';

import { useHttp } from './http';
import { useUserState, useNotificationState, useMenuState } from './state';
import { useRefreshToken } from './token';
import { useACL } from './useACL';

export function useInit() {
  const createHttp = useHttp();
  const acl = useACL();

  const [, setUser] = useUserState();
  const [, setNotification] = useNotificationState();
  const [, setExpands] = useMenuState();

  const refreshToken = useRefreshToken();

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

  const resetMenu = () => {
    setExpands(undefined);
  };

  return (user: UserState) => {
    refreshToken();
    handleUser(user);
    getNotification();
    resetMenu();
  };
}
