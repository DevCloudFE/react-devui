import type { Control, ControlMode } from '../core/useACL';
import type { RouteObject } from 'react-router-dom';

import { isUndefined, nth } from 'lodash';
import React, { useEffect } from 'react';
import { matchRoutes, Navigate, renderMatches, useLocation } from 'react-router-dom';

import { ROUTES_ACL } from '../config/acl';
import { LOGIN_PATH, TITLE_CONFIG } from '../config/other';
import { useMenu } from '../core';
import { useACLGuard, useTokenGuard } from './Routes.guard';
import { AppFCPLoader } from './components';
import { useTitle } from './components/route-header/hooks';
import AppExceptionRoute from './routes/exception/Exception';
import AppLayout from './routes/layout/Layout';
import AppLoginRoute from './routes/login/Login';

const AppAMapRoute = React.lazy(() => import('./routes/dashboard/AMap'));
const AppEChartsRoute = React.lazy(() => import('./routes/dashboard/ECharts'));

const AppACLRoute = React.lazy(() => import('./routes/test/acl/ACL'));
const AppHttpRoute = React.lazy(() => import('./routes/test/http/Http'));

export type CanActivateFn = (route: RouteItem) => true | React.ReactElement;

export interface RouteData {
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

export interface RouteItem extends Omit<RouteObject, 'children'> {
  children?: RouteItem[];
  data?: RouteData;
}

// I have a great implementation of route caching, but considering the synchronization of data between pages (like modifying list or detail page data), I ended up not introducing route caching.
export function AppRoutes() {
  const ACLGuard = useACLGuard();
  const tokenGuard = useTokenGuard();
  const location = useLocation();
  const [, allItem] = useMenu();
  const titles = useTitle();

  const routes = matchRoutes(
    [
      {
        path: LOGIN_PATH,
        element: <AppLoginRoute />,
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
                  acl: ROUTES_ACL.dashboard.echarts,
                  canActivate: [ACLGuard],
                },
              },
            ],
          },
          {
            path: 'test',
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
        children: [
          {
            index: true,
            element: '/exception',
          },
          {
            path: '403',
            element: <AppExceptionRoute status={403} />,
          },
          {
            path: '404',
            element: <AppExceptionRoute status={404} />,
          },
          {
            path: '500',
            element: <AppExceptionRoute status={500} />,
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
    if (!routes) {
      return null;
    }

    let canActivateChild: CanActivateFn[] = [];
    for (const route of routes) {
      const routeData = (route.route as RouteItem).data;
      if (routeData && routeData.canActivate) {
        for (const canActivate of routeData.canActivate.concat(canActivateChild)) {
          const can = canActivate(route.route);
          if (can !== true) {
            return can;
          }
        }
      }
      if (routeData && routeData.canActivateChild) {
        canActivateChild = canActivateChild.concat(routeData.canActivateChild);
      }
    }

    const currentRoute = routes[routes.length - 1].route;
    if (currentRoute.index === true) {
      const firstMenu = allItem.find((item) => item.id.startsWith(currentRoute.element as string));
      return <Navigate to={isUndefined(firstMenu) ? '/exception/404' : firstMenu.id} replace />;
    }
    return renderMatches(routes);
  })();

  useEffect(() => {
    const title = nth(titles, -1)?.[1];
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

  return element;
}
