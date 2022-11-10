import type { MenuItem } from '../config/menu';
import type { DMenuItem } from '@react-devui/ui/components/menu';

import { isObject, isUndefined } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { createGlobalState, useMount } from '@react-devui/hooks';

import { MENU } from '../config/menu';
import { useACL } from './useACL';

export interface MenuState {
  expands?: string[];
}
const useMenuState = createGlobalState<MenuState>({});

export function useMenu() {
  const acl = useACL();
  const { t } = useTranslation();
  const location = useLocation();
  const [menuState, setMenuState] = useMenuState();

  const res: {
    active?: { path: string; parentSub: MenuItem[] };
    firstCanActive?: { path: string; parentSub: MenuItem[] };
  } = {};
  const reduceMenu = (arr: MenuItem[], parentSub: MenuItem[]): DMenuItem<string>[] => {
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

      const { title: _title, titleI18n } = item;
      const title = _title ?? (isUndefined(titleI18n) ? undefined : t(titleI18n, { ns: 'title' }));
      const obj: DMenuItem<string> = {
        id: item.path,
        title: item.type === 'item' ? React.createElement(Link, { className: 'app-menu-link', tabIndex: -1, to: item.path }, title) : title,
        icon: item.icon ? React.createElement(item.icon) : undefined,
        type: item.type,
      };

      if (item.children) {
        obj.children = reduceMenu(item.children, parentSub.concat(item.type === 'sub' ? [item] : []));
        if (obj.children.length > 0) {
          newArr.push(obj);
        }
      } else {
        newArr.push(obj);
        if (item.path === location.pathname || (item.greedyMatch && location.pathname.startsWith(item.path + '/'))) {
          res.active = {
            path: item.path,
            parentSub,
          };
        }
        if (!item.disabled && isUndefined(res.firstCanActive)) {
          res.firstCanActive = {
            path: item.path,
            parentSub,
          };
        }
      }
    }
    return newArr;
  };
  const menu = reduceMenu(MENU, []);
  const getDefaultExpands = () =>
    (location.pathname === '/' ? res.firstCanActive?.parentSub : res.active?.parentSub)?.map((item) => item.path);

  useMount(() => {
    if (isUndefined(menuState.expands)) {
      setMenuState((draft) => {
        draft.expands = getDefaultExpands();
      });
    }
  });

  return [
    {
      menu,
      active: location.pathname === '/' ? res.firstCanActive : res.active,
      firstCanActive: res.firstCanActive,
      expands: menuState.expands ?? getDefaultExpands(),
    },
    setMenuState,
  ] as const;
}
