import { nth } from 'lodash';
import { useContext } from 'react';

import { getClassName } from '@react-devui/utils';

import { RouteStateContext } from '../../Routes';

export interface AppRouteHeaderHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  aActions?: React.ReactNode[];
}

export function AppRouteHeaderHeader(props: AppRouteHeaderHeaderProps): JSX.Element | null {
  const {
    children,
    aActions,

    ...restProps
  } = props;

  const { matchRoutes } = useContext(RouteStateContext);

  const title = (() => {
    if (matchRoutes) {
      const { title } = nth(matchRoutes, -1)!.route.data ?? {};
      return title;
    }
    return undefined;
  })();

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-route-header__header')}>
      <div className="app-route-header__header-title">{children ?? title}</div>
      <div className="app-route-header__header-actions">{aActions}</div>
    </div>
  );
}
