import type { Control, ControlMode } from '@react-devui/hooks/useACL';

import { DashboardOutlined, ExceptionOutlined, ExperimentOutlined, ProfileOutlined } from '@react-devui/icons';

import { ROUTES_ACL } from './acl';

export interface MenuItem {
  path: string;
  type: 'item' | 'group' | 'sub';
  title?: string;
  titleI18n?: string;
  icon?: React.FunctionComponent;
  greedyMatch?: boolean;
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
    titleI18n: 'Dashboard',
    icon: DashboardOutlined,
    children: [
      {
        path: '/dashboard/amap',
        type: 'item',
        titleI18n: 'AMap',
        acl: ROUTES_ACL['/dashboard/amap'],
      },
      {
        path: '/dashboard/echarts',
        type: 'item',
        titleI18n: 'ECharts',
        acl: ROUTES_ACL['/dashboard/echarts'],
      },
    ],
  },
  {
    path: '/list',
    type: 'sub',
    titleI18n: 'List',
    icon: ProfileOutlined,
    children: [
      {
        path: '/list/standard-table',
        type: 'item',
        titleI18n: 'Standard Table',
        greedyMatch: true,
        acl: ROUTES_ACL['/list/standard-table'],
      },
    ],
  },
  {
    path: '/test',
    type: 'sub',
    titleI18n: 'Test',
    icon: ExperimentOutlined,
    children: [
      {
        path: '/test/acl',
        type: 'item',
        titleI18n: 'ACL',
        acl: ROUTES_ACL['/test/acl'],
      },
      {
        path: '/test/http',
        type: 'item',
        titleI18n: 'Http',
        acl: ROUTES_ACL['/test/http'],
      },
    ],
  },
  {
    path: '/exception',
    type: 'sub',
    titleI18n: 'Exception',
    icon: ExceptionOutlined,
    children: [
      {
        path: '/exception/403',
        type: 'item',
        titleI18n: '403',
      },
      {
        path: '/exception/404',
        type: 'item',
        titleI18n: '404',
      },
      {
        path: '/exception/500',
        type: 'item',
        titleI18n: '500',
      },
    ],
  },
];
