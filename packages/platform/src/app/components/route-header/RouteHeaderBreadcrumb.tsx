import type { DBreadcrumbItem } from '@react-devui/ui/components/breadcrumb';

import { isUndefined } from 'lodash';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { DBreadcrumb } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { RouteStateContext } from '../../Routes';

export interface AppRouteHeaderBreadcrumbProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aSeparator?: React.ReactNode;
}

export function AppRouteHeaderBreadcrumb(props: AppRouteHeaderBreadcrumbProps): JSX.Element | null {
  const {
    aSeparator,

    ...restProps
  } = props;

  const { matchRoutes } = useContext(RouteStateContext);

  const breadcrumb = (() => {
    if (matchRoutes) {
      const list: DBreadcrumbItem<string>[] = [];
      for (const match of matchRoutes) {
        if (match.route.data) {
          const { title: _title, breadcrumb = {} } = match.route.data;
          if (breadcrumb) {
            const title = breadcrumb.title ?? _title;
            if (!isUndefined(title)) {
              const link = breadcrumb.link ?? false;
              list.push({
                id: title,
                title: link ? (
                  <Link className="app-route-header__breadcrumb-link" to={match.pathname}>
                    {title}
                  </Link>
                ) : (
                  title
                ),
                link,
                separator: breadcrumb.separator,
              });
            }
          }
        }
      }
      return list;
    }
  })();

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-route-header__breadcrumb')}>
      {breadcrumb && <DBreadcrumb dList={breadcrumb} dSeparator={aSeparator} />}
    </div>
  );
}
