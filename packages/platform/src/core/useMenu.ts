import type { MenuItem } from '../config/menu';
import type { DMenuItem } from '@react-devui/ui/components/menu';

import { isObject, isUndefined } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { NotificationService } from '@react-devui/ui';

import { MENU } from '../config/menu';
import { LOGIN_PATH } from '../config/other';
import { useACL } from './useACL';

export function useMenu() {
  const acl = useACL();
  const { t } = useTranslation();
  const navigate = useNavigate();

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

      const { title: _title, titleI18n } = item;
      const title = _title ?? (isUndefined(titleI18n) ? undefined : t(titleI18n, { ns: 'title' }));
      const obj: DMenuItem<string> = {
        id: item.path,
        title: item.type === 'item' ? React.createElement(Link, { className: 'app-menu-link', tabIndex: -1, to: item.path }, title) : title,
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

  //#region Handle no menu
  if (allItem.length === 0) {
    NotificationService.open({
      dTitle: t('User has no menu'),
      dDescription: t('Please contact the administrator'),
      dType: 'error',
    });
    navigate(LOGIN_PATH, { replace: true });
  }
  //#endregion

  return [menu, allItem] as const;
}
