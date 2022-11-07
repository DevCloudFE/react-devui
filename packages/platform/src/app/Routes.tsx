import type { Control, ControlMode } from '../core/useACL';
import type { IndexRouteObject, NonIndexRouteObject, RouteMatch } from 'react-router-dom';

import { nth } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { matchRoutes, Navigate, renderMatches, useLocation } from 'react-router-dom';

import { ROUTES_ACL } from '../config/acl';
import { LOGIN_PATH } from '../config/other';
import { useACLGuard, useTokenGuard } from './Routes.guard';
import { AppFCPLoader } from './components';
import { usePageTitle } from './hooks';
import AppHomeRoute from './routes/Home';
import AppExceptionRoute from './routes/exception/Exception';
import AppLayout from './routes/layout/Layout';
import AppLoginRoute from './routes/login/Login';

const AppAMapRoute = React.lazy(() => import('./routes/dashboard/amap/AMap'));
const AppEChartsRoute = React.lazy(() => import('./routes/dashboard/echarts/ECharts'));

const AppStandardTableRoute = React.lazy(() => import('./routes/list/standard-table/StandardTable'));

const AppACLRoute = React.lazy(() => import('./routes/test/acl/ACL'));
const AppHttpRoute = React.lazy(() => import('./routes/test/http/Http'));

export interface RouteStateContextData {
  matchRoutes: RouteMatch<string, RouteItem>[] | null;
}
export const RouteStateContext = React.createContext<RouteStateContextData>({
  matchRoutes: null,
});

export type CanActivateFn = (route: RouteItem) => true | React.ReactElement;

export interface RouteData {
  title?: string;
  breadcrumb?:
    | {
        title?: string;
        link?: boolean;
        separator?: React.ReactNode;
      }
    | false;
  acl?:
    | {
        control: Control | Control[];
        mode?: ControlMode;
      }
    | Control
    | Control[];
  canActivate?: CanActivateFn[];
  canActivateChild?: CanActivateFn[];
  cache?: string;
}

export interface IndexRouteItem extends IndexRouteObject {
  data?: RouteData;
}
export interface NonIndexRouteItem extends Omit<NonIndexRouteObject, 'children'> {
  children?: NonIndexRouteItem[];
  data?: RouteData;
}
export type RouteItem = IndexRouteItem | NonIndexRouteItem;

// I have a great implementation of route caching, but considering the synchronization of data between pages (like modifying list or detail page data), I ended up not introducing route caching.
export function AppRoutes() {
  const ACLGuard = useACLGuard();
  const tokenGuard = useTokenGuard();
  const location = useLocation();
  const { t } = useTranslation();

  const matches = matchRoutes(
    [
      {
        path: LOGIN_PATH,
        element: <AppLoginRoute />,
        data: {
          title: t('login', { ns: 'title' }),
        },
      },
      {
        path: '/',
        element: <AppLayout />,
        data: {
          breadcrumb: {
            title: t('home', { ns: 'title' }),
            link: true,
          },
          canActivate: [tokenGuard],
          canActivateChild: [tokenGuard],
        },
        children: [
          {
            index: true,
            element: <AppHomeRoute />,
          },
          {
            path: 'dashboard',
            data: {
              breadcrumb: {
                title: t('dashboard.', { ns: 'title' }),
              },
            },
            children: [
              {
                path: 'amap',
                element: (
                  <React.Suspense fallback={<AppFCPLoader />}>
                    <AppAMapRoute />
                  </React.Suspense>
                ),
                data: {
                  title: t('dashboard.amap', { ns: 'title' }),
                  breadcrumb: {
                    link: true,
                  },
                  acl: ROUTES_ACL.dashboard.amap,
                  canActivate: [ACLGuard],
                },
              },
              {
                path: 'echarts',
                element: (
                  <React.Suspense fallback={<AppFCPLoader />}>
                    <AppEChartsRoute />
                  </React.Suspense>
                ),
                data: {
                  title: t('dashboard.echarts', { ns: 'title' }),
                  breadcrumb: {
                    link: true,
                  },
                  acl: ROUTES_ACL.dashboard.echarts,
                  canActivate: [ACLGuard],
                },
              },
            ],
          },
          {
            path: 'list',
            data: {
              breadcrumb: {
                title: t('list.', { ns: 'title' }),
              },
            },
            children: [
              {
                path: 'standard-table',
                element: (
                  <React.Suspense fallback={<AppFCPLoader />}>
                    <AppStandardTableRoute />
                  </React.Suspense>
                ),
                data: {
                  title: t('list.standard-table', { ns: 'title' }),
                  breadcrumb: {
                    link: true,
                  },
                  acl: ROUTES_ACL.list['standard-table'],
                  canActivate: [ACLGuard],
                },
              },
            ],
          },
          {
            path: 'test',
            data: {
              breadcrumb: {
                title: t('test.', { ns: 'title' }),
              },
            },
            children: [
              {
                path: 'acl',
                element: (
                  <React.Suspense fallback={<AppFCPLoader />}>
                    <AppACLRoute />
                  </React.Suspense>
                ),
                data: {
                  title: t('test.acl', { ns: 'title' }),
                  acl: ROUTES_ACL.test.acl,
                  canActivate: [ACLGuard],
                },
              },
              {
                path: 'http',
                element: (
                  <React.Suspense fallback={<AppFCPLoader />}>
                    <AppHttpRoute />
                  </React.Suspense>
                ),
                data: {
                  title: t('test.http', { ns: 'title' }),
                  acl: ROUTES_ACL.test.http,
                  canActivate: [ACLGuard],
                },
              },
            ],
          },
        ],
      },
      {
        path: '/exception/:status',
        element: <AppExceptionRoute />,
      },
      {
        path: '*',
        element: <Navigate to="/exception/404" replace />,
      },
    ] as RouteItem[],
    location
  );

  const element: React.ReactNode = (() => {
    if (!matches) {
      return null;
    }

    let canActivateChild: CanActivateFn[] = [];
    for (const match of matches) {
      const routeData = (match.route as RouteItem).data;
      if (routeData && routeData.canActivate) {
        for (const canActivate of routeData.canActivate.concat(canActivateChild)) {
          const can = canActivate(match.route);
          if (can !== true) {
            return can;
          }
        }
      }
      if (routeData && routeData.canActivateChild) {
        canActivateChild = canActivateChild.concat(routeData.canActivateChild);
      }
    }

    return renderMatches(matches);
  })();

  const { title } = nth(matches, -1)?.route.data ?? {};
  usePageTitle(title);

  return (
    <RouteStateContext.Provider
      value={{
        matchRoutes: matches,
      }}
    >
      {element}
    </RouteStateContext.Provider>
  );
}
