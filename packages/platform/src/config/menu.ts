import type { Control, ControlMode } from '../app/hooks/useACL';

import { DashboardOutlined, ExceptionOutlined } from '@react-devui/icons';

import { ROUTES_ACL } from './acl';

export interface MenuItem {
  path: string;
  title?: string;
  titleI18n?: string;
  type: 'item' | 'group' | 'sub';
  icon?: React.FunctionComponent;
  disabled?: boolean;
  acl?:
    | {
        control: Control | Control[];
        mode?: ControlMode;
      }
    | Control
    | Control[];
  children?: MenuItem[];
}

export const MENU: MenuItem[] = [
  {
    path: '/dashboard',
    titleI18n: 'Dashboard',
    type: 'sub',
    icon: DashboardOutlined,
    children: [
      {
        path: '/dashboard/amap',
        titleI18n: 'Amap',
        type: 'item',
        acl: ROUTES_ACL.dashboard.amap,
      },
      {
        path: '/dashboard/echarts',
        titleI18n: 'Echarts',
        type: 'item',
        acl: ROUTES_ACL.dashboard.echarts,
      },
    ],
  },
  {
    path: '/exception',
    titleI18n: 'Exception',
    type: 'sub',
    icon: ExceptionOutlined,
    children: [
      {
        path: '/exception/403',
        titleI18n: '403',
        type: 'item',
      },
      {
        path: '/exception/404',
        titleI18n: '404',
        type: 'item',
      },
      {
        path: '/exception/500',
        titleI18n: '500',
        type: 'item',
      },
    ],
  },
];
