import type { Control, ControlMode } from '../core/useACL';

import { DashboardOutlined, ExceptionOutlined, ExperimentOutlined, ProfileOutlined } from '@react-devui/icons';

import { ROUTES_ACL } from './acl';

export interface MenuItem {
  path: string;
  type: 'item' | 'group' | 'sub';
  title?: string;
  titleI18n?: string;
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
    type: 'sub',
    titleI18n: 'dashboard.',
    icon: DashboardOutlined,
    children: [
      {
        path: '/dashboard/amap',
        type: 'item',
        titleI18n: 'dashboard.amap',
        acl: ROUTES_ACL.dashboard.amap,
      },
      {
        path: '/dashboard/echarts',
        type: 'item',
        titleI18n: 'dashboard.echarts',
        acl: ROUTES_ACL.dashboard.echarts,
      },
    ],
  },
  {
    path: '/list',
    type: 'sub',
    titleI18n: 'list.',
    icon: ProfileOutlined,
    children: [
      {
        path: '/list/standard-table',
        type: 'item',
        titleI18n: 'list.standard-table',
        acl: ROUTES_ACL.list['standard-table'],
      },
    ],
  },
  {
    path: '/test',
    type: 'sub',
    titleI18n: 'test.',
    icon: ExperimentOutlined,
    children: [
      {
        path: '/test/acl',
        type: 'item',
        titleI18n: 'test.acl',
        acl: ROUTES_ACL.test.acl,
      },
      {
        path: '/test/http',
        type: 'item',
        titleI18n: 'test.http',
        acl: ROUTES_ACL.test.http,
      },
    ],
  },
  {
    path: '/exception',
    type: 'sub',
    titleI18n: 'exception.',
    icon: ExceptionOutlined,
    children: [
      {
        path: '/exception/403',
        type: 'item',
        titleI18n: 'exception.403',
      },
      {
        path: '/exception/404',
        type: 'item',
        titleI18n: 'exception.404',
      },
      {
        path: '/exception/500',
        type: 'item',
        titleI18n: 'exception.500',
      },
    ],
  },
];
