import type { MenuItem } from '../../config/state';
import type { DMenuItem } from '@react-devui/ui/components/menu';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { DashboardOutlined, ExceptionOutlined } from '@react-devui/icons';

export function useMenu() {
  const { t } = useTranslation('menu');

  const menu: MenuItem[] = [
    {
      id: '/dashboard',
      title: t('Dashboard'),
      type: 'sub',
      icon: DashboardOutlined,
      children: [
        {
          id: '/dashboard/amap',
          title: t('Amap'),
          type: 'item',
        },
        {
          id: '/dashboard/echarts',
          title: t('Echarts'),
          type: 'item',
        },
      ],
    },
    {
      id: '/exception',
      title: t('Exception'),
      type: 'sub',
      icon: ExceptionOutlined,
      children: [
        {
          id: '/exception/403',
          title: t('403'),
          type: 'item',
        },
        {
          id: '/exception/404',
          title: t('404'),
          type: 'item',
        },
        {
          id: '/exception/500',
          title: t('500'),
          type: 'item',
        },
      ],
    },
  ];

  const reduceMenu = (arr: MenuItem[]): DMenuItem<string>[] => {
    const newArr: DMenuItem<string>[] = [];
    for (const item of arr) {
      const obj: DMenuItem<string> = {
        id: item.id,
        title:
          item.type === 'item'
            ? React.createElement(Link, { className: 'app-layout-sidebar__link', tabIndex: -1, to: item.id }, item.title)
            : item.title,
        icon: item.icon ? React.createElement(item.icon) : undefined,
        type: item.type,
      };

      if (item.children) {
        obj.children = reduceMenu(item.children);
      }

      newArr.push(obj);
    }
    return newArr;
  };

  return reduceMenu(menu);
}
