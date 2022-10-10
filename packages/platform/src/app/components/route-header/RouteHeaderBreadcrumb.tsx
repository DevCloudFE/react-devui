import type { DBreadcrumbItem } from '@react-devui/ui/components/breadcrumb';
import type { DId } from '@react-devui/ui/utils/types';

import { isUndefined } from 'lodash';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { DBreadcrumb } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { RouteStateContext } from '../../Routes';

export interface AppRouteHeaderBreadcrumbProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aHome?: DBreadcrumbItem<DId>;
  aSeparator?: React.ReactNode;
}

export function AppRouteHeaderBreadcrumb(props: AppRouteHeaderBreadcrumbProps): JSX.Element | null {
  const {
    aHome,
    aSeparator,

    ...restProps
  } = props;

  const { matchRoutes } = useContext(RouteStateContext);

  const { t } = useTranslation();

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-route-header__breadcrumb')}>
      {matchRoutes && (
        <DBreadcrumb
          dList={(isUndefined(aHome) ? [] : [aHome]).concat(
            matchRoutes
              .filter(
                (match) =>
                  (!isUndefined(match.route.data?.title) || !isUndefined(match.route.data?.titleI18n)) &&
                  match.route.data?.breadcrumb !== false
              )
              .map((match, index, arr) => {
                const { title: _title, titleI18n, breadcrumb } = match.route.data!;
                if (isUndefined(breadcrumb)) {
                  const title = _title ?? t(titleI18n!, { ns: 'title' });
                  const isLast = index === arr.length - 1;

                  return {
                    id: index,
                    title: isLast ? (
                      title
                    ) : (
                      <Link className="app-route-header__breadcrumb-link" to={match.pathname}>
                        {title}
                      </Link>
                    ),
                    link: !isLast,
                  };
                }
                return breadcrumb as DBreadcrumbItem<DId>;
              })
          )}
          dSeparator={aSeparator}
        />
      )}
    </div>
  );
}
