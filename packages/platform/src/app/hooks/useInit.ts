import type { MenuItem } from '../../config/menu';
import type { PREV_ROUTE_KEY } from '../../config/other';
import type { NotificationItem, UserState } from '../../config/state';
import type { DMenuItem } from '@react-devui/ui/components/menu';

import { isNull, isObject, isUndefined } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { MENU } from '../../config/menu';
import { useMenuState } from '../../config/state';
import { useNotificationState } from '../../config/state';
import { useUserState } from '../../config/state';
import { TOKEN, TOKEN_REFRESH, TOKEN_REFRESH_OFFSET } from '../../config/token';
import { useACL } from './useACL';
import { useHttp } from './useHttp';

let CLEAR_TOKEN_REFRESH: (() => void) | undefined;

export function useInit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as null | { [PREV_ROUTE_KEY]?: Location })?.from?.pathname;
  const createHttp = useHttp();
  const acl = useACL();

  const [, setUser] = useUserState();
  const [, setMenu] = useMenuState();
  const [, setNotification] = useNotificationState();

  const refreshToken = () => {
    CLEAR_TOKEN_REFRESH?.();
    const expiration = TOKEN.expiration;
    if (TOKEN_REFRESH && !isNull(expiration)) {
      const refresh = () => {
        const [http, abort] = createHttp({ unmount: false });
        const tid = window.setTimeout(() => {
          http<string>({
            url: '/api/auth/refresh',
            method: 'post',
          }).subscribe({
            next: (res) => {
              TOKEN.token = res;
              refresh();
            },
          });
        }, expiration - Date.now() - TOKEN_REFRESH_OFFSET);
        CLEAR_TOKEN_REFRESH = () => {
          clearTimeout(tid);
          abort();
        };
      };
      refresh();
    }
  };

  const handleUser = (user: UserState) => {
    setUser(user);

    //#region ACL
    acl.setFull(user.role === 'admin');
    acl.set([]);
    //#endregion

    //#region Menu
    const allItem: { id: string; parentSub: string[] }[] = [];
    const reduceMenu = (arr: MenuItem[], parentSub: string[] = []): DMenuItem<string>[] => {
      const newArr: DMenuItem<string>[] = [];
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

        const title = item.title ?? t(item.titleI18n!);
        const obj: DMenuItem<string> = {
          id: item.path,
          title:
            item.type === 'item'
              ? React.createElement(Link, { className: 'app-layout-sidebar__link', tabIndex: -1, to: item.path }, title)
              : title,
          icon: item.icon ? React.createElement(item.icon) : undefined,
          type: item.type,
        };

        if (item.children) {
          obj.children = reduceMenu(item.children, parentSub.concat(item.type === 'sub' ? [item.path] : []));
          if (obj.children.length > 0) {
            newArr.push(obj);
          }
        } else {
          newArr.push(obj);
          allItem.push({ id: item.path, parentSub });
        }
      }
      return newArr;
    };

    const menu = reduceMenu(MENU);
    const toFirstItem = () => {
      setMenu({ menu, expands: allItem[0].parentSub });
      navigate(allItem[0].id, { replace: true });
    };
    if (isUndefined(from)) {
      toFirstItem();
    } else {
      const findIndex = allItem.findIndex((item) => item.id === from);
      if (findIndex === -1) {
        toFirstItem();
      } else {
        setMenu({ menu, expands: allItem[findIndex].parentSub });
        navigate(from, { replace: true });
      }
    }
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
