import type { Control, ControlMode } from './core/useACL';
import type { IndexRouteObject, NonIndexRouteObject, RouteMatch } from 'react-router-dom';

import { isFunction, isUndefined, nth } from 'lodash';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { matchRoutes, Navigate, renderMatches, useLocation } from 'react-router-dom';

import { useACLGuard, useTokenGuard } from './Routes.guard';
import { AppFCPLoader } from './components';
import { ROUTES_ACL } from './config/acl';
import { APP_NAME, LOGIN_PATH } from './config/other';
import AppHomeRoute from './routes/Home';
import AppExceptionRoute from './routes/exception/Exception';
import AppLayout from './routes/layout/Layout';
import AppLoginRoute from './routes/login/Login';

const ROUTES = {
  '/dashboard/amap': React.lazy(() => import('./routes/dashboard/amap/AMap')),
  '/dashboard/echarts': React.lazy(() => import('./routes/dashboard/echarts/ECharts')),
  '/list/standard-table': React.lazy(() => import('./routes/list/standard-table/StandardTable')),
  '/list/standard-table/:id': React.lazy(() => import('./routes/list/standard-table/detail/Detail')),
  '/test/acl': React.lazy(() => import('./routes/test/acl/ACL')),
  '/test/http': React.lazy(() => import('./routes/test/http/Http')),
};

const TITLE_CONFIG: {
  default: string;
  separator: string;
  prefix?: string;
  suffix?: string;
} = {
  default: APP_NAME,
  separator: ' - ',
  suffix: APP_NAME,
};

export interface RouteStateContextData {
  matchRoutes: RouteMatch<string, RouteItem>[] | null;
  title?: string;
}
export const RouteStateContext = React.createContext<RouteStateContextData>({
  matchRoutes: null,
});

export type CanActivateFn = (route: RouteItem) => true | React.ReactElement;

export interface RouteData {
  title?: string;
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

export interface IndexRouteItemInput extends IndexRouteObject {
  data?: RouteData | ((params: any) => RouteData);
}
export interface NonIndexRouteItemInput extends Omit<NonIndexRouteObject, 'children'> {
  children?: NonIndexRouteItemInput[];
  data?: RouteData | ((params: any) => RouteData);
}
export type RouteItemInput = IndexRouteItemInput | NonIndexRouteItemInput;

// I have a great implementation of route caching, but considering the synchronization of data between pages (like modifying list or detail page data), I ended up not introducing route caching.
export const AppRoutes = React.memo(() => {
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
          title: t('Login', { ns: 'title' }),
        },
      },
      {
        path: '/',
        element: <AppHomeRoute />,
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
            path: 'dashboard',
            children: [
              {
                index: true,
                element: <Navigate to="/exception/404" replace />,
              },
              {
                path: 'amap',
                element: <React.Suspense fallback={<AppFCPLoader />}>{React.createElement(ROUTES['/dashboard/amap'])}</React.Suspense>,
                data: {
                  title: t('AMap', { ns: 'title' }),
                  acl: ROUTES_ACL['/dashboard/amap'],
                  canActivate: [ACLGuard],
                },
              },
              {
                path: 'echarts',
                element: <React.Suspense fallback={<AppFCPLoader />}>{React.createElement(ROUTES['/dashboard/echarts'])}</React.Suspense>,
                data: {
                  title: t('ECharts', { ns: 'title' }),
                  acl: ROUTES_ACL['/dashboard/echarts'],
                  canActivate: [ACLGuard],
                },
              },
            ],
          },
          {
            path: 'list',
            children: [
              {
                index: true,
                element: <Navigate to="/exception/404" replace />,
              },
              {
                path: 'standard-table',
                element: <React.Suspense fallback={<AppFCPLoader />}>{React.createElement(ROUTES['/list/standard-table'])}</React.Suspense>,
                data: {
                  title: t('Standard Table', { ns: 'title' }),
                  acl: ROUTES_ACL['/list/standard-table'],
                  canActivate: [ACLGuard],
                },
              },
              {
                path: 'standard-table/:id',
                element: (
                  <React.Suspense fallback={<AppFCPLoader />}>{React.createElement(ROUTES['/list/standard-table/:id'])}</React.Suspense>
                ),
                data: {
                  title: t('Device Detail', { ns: 'title' }),
                  acl: ROUTES_ACL['/list/standard-table/:id'],
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
                element: <Navigate to="/exception/404" replace />,
              },
              {
                path: 'acl',
                element: <React.Suspense fallback={<AppFCPLoader />}>{React.createElement(ROUTES['/test/acl'])}</React.Suspense>,
                data: {
                  title: t('ACL', { ns: 'title' }),
                  acl: ROUTES_ACL['/test/acl'],
                  canActivate: [ACLGuard],
                },
              },
              {
                path: 'http',
                element: <React.Suspense fallback={<AppFCPLoader />}>{React.createElement(ROUTES['/test/http'])}</React.Suspense>,
                data: {
                  title: t('Http', { ns: 'title' }),
                  acl: ROUTES_ACL['/test/http'],
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
        data: (params) => ({
          title: params.status,
        }),
      },
      {
        path: '*',
        element: <Navigate to="/exception/404" replace />,
      },
    ] as RouteItemInput[],
    location
  ) as any as RouteMatch<string, RouteItem>[] | null;
  if (matches) {
    matches.forEach((matche) => {
      if (isFunction(matche.route.data)) {
        matche.route.data = matche.route.data(matche.params);
      }
    });
  }

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

  const title = (() => {
    if (matches) {
      const match = nth(matches, -1);
      if (match) {
        const { title } = match.route.data ?? {};
        return isFunction(title) ? title(match.params) : title;
      }
    }
  })();
  useEffect(() => {
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
    return () => {
      document.title = TITLE_CONFIG.default;
    };
  });

  return (
    <RouteStateContext.Provider
      value={{
        matchRoutes: matches,
        title,
      }}
    >
      {element}
    </RouteStateContext.Provider>
  );
});
