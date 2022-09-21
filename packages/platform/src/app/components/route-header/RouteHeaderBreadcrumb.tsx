import { isUndefined } from 'lodash';
import { Link } from 'react-router-dom';

import { DBreadcrumb } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { useTitle } from './hooks';

export interface AppRouteHeaderBreadcrumbProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aHome?: [string, React.ReactNode];
  aSeparator?: React.ReactNode;
}

export function AppRouteHeaderBreadcrumb(props: AppRouteHeaderBreadcrumbProps): JSX.Element | null {
  const {
    aHome,
    aSeparator,

    ...restProps
  } = props;

  const titles = useTitle();

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-route-header__breadcrumb')}>
      <DBreadcrumb
        dList={(isUndefined(aHome)
          ? []
          : [
              {
                id: aHome[0],
                title: aHome[1],
                link: true,
              },
            ]
        ).concat(
          titles.map(([, title], index, arr) => {
            const path =
              '/' +
              arr
                .slice(0, index + 1)
                .map(([p]) => p)
                .join('/');
            const isLast = index === arr.length - 1;

            return {
              id: path,
              title: isLast ? (
                title
              ) : (
                <Link className="app-route-header__breadcrumb-link" to={path}>
                  {title}
                </Link>
              ),
              link: !isLast,
            };
          })
        )}
        dSeparator={aSeparator}
      />
    </div>
  );
}
