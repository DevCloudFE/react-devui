import { isUndefined, nth } from 'lodash';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation();

  const title = (() => {
    if (matchRoutes) {
      const { title: _title, titleI18n } = nth(matchRoutes, -1)!.route.data ?? {};
      return _title ?? (isUndefined(titleI18n) ? undefined : t(titleI18n, { ns: 'title' }));
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
