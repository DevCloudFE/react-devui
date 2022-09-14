import type { Control, ControlMode } from './hooks/useACL';
import type { RouteObject } from 'react-router-dom';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { matchRoutes, Navigate, renderMatches, useLocation } from 'react-router-dom';

import { LOGIN_PATH, TITLE_CONFIG } from '../config/other';
import { useACLGuard, useTokenGuard } from './Routes.guard';
import AppExceptionRoute from './routes/Exception';
import AppLoginRoute from './routes/Login';
import AppLayout from './routes/layout/Layout';

const AppAmapRoute = React.lazy(() => import('./routes/dashboard/Amap'));
const AppEchartsRoute = React.lazy(() => import('./routes/dashboard/Echarts'));

export type CanActivateFn = (route: RouteItem) => true | React.ReactElement;

export interface RouteData {
  title?: string;
  titleI18n?: string;
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
  const { t } = useTranslation('title');
  const ACLGuard = useACLGuard();
  const tokenGuard = useTokenGuard();
  const location = useLocation();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const routes = matchRoutes(
    [
      {
        path: LOGIN_PATH,
        element: <AppLoginRoute />,
        data: {
          titleI18n: 'Login',
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
            // TODO: Use first menu
            element: <Navigate to="/dashboard/amap" replace />,
          },
          {
            path: 'dashboard',
            children: [
              {
                index: true,
                element: <Navigate to="/dashboard/amap" replace />,
              },
              {
                path: 'amap',
                element: (
                  <React.Suspense fallback={<div>loader</div>}>
                    <AppAmapRoute />
                  </React.Suspense>
                ),
                data: {
                  title: 'AMap',
                  acl: 'page_amap',
                  canActivate: [ACLGuard],
                },
              },
              {
                path: 'echarts',
                element: (
                  <React.Suspense fallback={<div>loader</div>}>
                    <AppEchartsRoute />
                  </React.Suspense>
                ),
                data: {
                  title: 'ECharts',
                  acl: 'page_echarts',
                  canActivate: [ACLGuard],
                },
              },
            ],
          },
          {
            path: 'exception',
            children: [
              {
                index: true,
                element: <Navigate to="/exception/403" replace />,
              },
              {
                path: '403',
                element: <AppExceptionRoute status={403} />,
                data: {
                  title: '403',
                },
              },
              {
                path: '404',
                element: <AppExceptionRoute status={404} />,
                data: {
                  title: '404',
                },
              },
              {
                path: '500',
                element: <AppExceptionRoute status={500} />,
                data: {
                  title: '500',
                },
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/exception/404" replace />,
      },
    ] as RouteItem[],
    location
  )!;

  let currentRouteData: RouteData | undefined;
  const element: React.ReactNode = (() => {
    let canActivateChild: CanActivateFn[] = [];
    let index = -1;
    for (const route of routes) {
      index += 1;
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

      if (index === routes.length - 1) {
        currentRouteData = routeData;
      }
    }

    return renderMatches(routes);
  })();

  useEffect(() => {
    if (currentRouteData && (currentRouteData.title || currentRouteData.titleI18n)) {
      const title = [currentRouteData.title ? currentRouteData.title : t(currentRouteData.titleI18n!)];
      if (TITLE_CONFIG.prefix) {
        title.unshift(TITLE_CONFIG.prefix);
      }
      if (TITLE_CONFIG.suffix) {
        title.push(TITLE_CONFIG.suffix);
      }
      document.title = title.join(TITLE_CONFIG.separator ?? ' - ');
    } else {
      document.title = TITLE_CONFIG.default;
    }
  });

  return element;
}
