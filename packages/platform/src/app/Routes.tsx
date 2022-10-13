import type { Control, ControlMode } from '../core/useACL';
import type { DBreadcrumbItem } from '@react-devui/ui/components/breadcrumb';
import type { DId } from '@react-devui/ui/utils/types';
import type { IndexRouteObject, NonIndexRouteObject, RouteMatch } from 'react-router-dom';

import { isUndefined, nth } from 'lodash';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { matchRoutes, Navigate, renderMatches, useLocation } from 'react-router-dom';

import { ROUTES_ACL } from '../config/acl';
import { LOGIN_PATH, TITLE_CONFIG } from '../config/other';
import { useMenu } from '../core';
import { useACLGuard, useTokenGuard } from './Routes.guard';
import { AppFCPLoader } from './components';
import AppExceptionRoute from './routes/exception/Exception';
import AppLayout from './routes/layout/Layout';
import AppLoginRoute from './routes/login/Login';

const AppAMapRoute = React.lazy(() => import('./routes/dashboard/amap/AMap'));
const AppEChartsRoute = React.lazy(() => import('./routes/dashboard/echarts/ECharts'));

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
  titleI18n?: string;
  breadcrumb?: DBreadcrumbItem<DId> | false;
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
  const [, allItem] = useMenu();
  const { t } = useTranslation();

  const matches = matchRoutes(
    [
      {
        path: LOGIN_PATH,
        element: <AppLoginRoute />,
        data: {
          titleI18n: 'login',
        },
      },
      {
        path: '/',
        element: <AppLayout />,
        data: {
          canActivate: [tokenGuard],
          canActivateChild: [tokenGuard],
        },
        children: [
          {
            index: true,
            element: '/',
          },
          {
            path: 'dashboard',
            data: {
              titleI18n: 'dashboard.',
            },
            children: [
              {
                index: true,
                element: '/dashboard',
              },
              {
                path: 'amap',
                element: (
                  <React.Suspense fallback={<AppFCPLoader />}>
                    <AppAMapRoute />
                  </React.Suspense>
                ),
                data: {
                  titleI18n: 'dashboard.amap',
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
                  titleI18n: 'dashboard.echarts',
                  acl: ROUTES_ACL.dashboard.echarts,
                  canActivate: [ACLGuard],
                },
              },
            ],
          },
          {
            path: 'test',
            data: {
              titleI18n: 'test.',
            },
            children: [
              {
                index: true,
                element: '/test',
              },
              {
                path: 'acl',
                element: (
                  <React.Suspense fallback={<AppFCPLoader />}>
                    <AppACLRoute />
                  </React.Suspense>
                ),
                data: {
                  titleI18n: 'test.acl',
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
                  titleI18n: 'test.http',
                  acl: ROUTES_ACL.test.http,
                  canActivate: [ACLGuard],
                },
              },
            ],
          },
        ],
      },
      {
        path: 'exception',
        data: {
          titleI18n: 'exception.',
        },
        children: [
          {
            index: true,
            element: '/exception',
          },
          {
            path: '403',
            element: <AppExceptionRoute status={403} />,
            data: {
              titleI18n: 'exception.403',
            },
          },
          {
            path: '404',
            element: <AppExceptionRoute status={404} />,
            data: {
              titleI18n: 'exception.404',
            },
          },
          {
            path: '500',
            element: <AppExceptionRoute status={500} />,
            data: {
              titleI18n: 'exception.500',
            },
          },
        ],
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

    const currentRoute = matches[matches.length - 1].route;
    if (currentRoute.index === true) {
      const firstMenu = allItem.find((item) => item.id.startsWith(currentRoute.element as string));
      return <Navigate to={isUndefined(firstMenu) ? '/exception/404' : firstMenu.id} replace />;
    }
    return renderMatches(matches);
  })();

  useEffect(() => {
    const { title: _title, titleI18n } = nth(matches, -1)?.route.data ?? {};
    const title = _title ?? (isUndefined(titleI18n) ? undefined : t(titleI18n, { ns: 'title' }));
    if (isUndefined(title)) {
      document.title = TITLE_CONFIG.default;
    } else {
      const arr = [title];
      if (TITLE_CONFIG.prefix) {
        arr.unshift(TITLE_CONFIG.prefix);
      }
      if (TITLE_CONFIG.suffix) {
        arr.push(TITLE_CONFIG.suffix);
      }
      document.title = arr.join(TITLE_CONFIG.separator ?? ' - ');
    }
  });

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
