import type { Control, ControlMode } from '../core/useACL';

import { DashboardOutlined, ExceptionOutlined, ExperimentOutlined } from '@react-devui/icons';

import { ROUTES_ACL } from './acl';

export interface MenuItem {
  path: string;
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
    type: 'sub',
    icon: DashboardOutlined,
    children: [
      {
        path: '/dashboard/amap',
        type: 'item',
        acl: ROUTES_ACL.dashboard.amap,
      },
      {
        path: '/dashboard/echarts',
        type: 'item',
        acl: ROUTES_ACL.dashboard.echarts,
      },
    ],
  },
  {
    path: '/test',
    type: 'sub',
    icon: ExperimentOutlined,
    children: [
      {
        path: '/test/acl',
        type: 'item',
        acl: ROUTES_ACL.test.acl,
      },
      {
        path: '/test/http',
        type: 'item',
        acl: ROUTES_ACL.test.http,
      },
    ],
  },
  {
    path: '/exception',
    type: 'sub',
    icon: ExceptionOutlined,
    children: [
      {
        path: '/exception/403',
        type: 'item',
      },
      {
        path: '/exception/404',
        type: 'item',
      },
      {
        path: '/exception/500',
        type: 'item',
      },
    ],
  },
];
