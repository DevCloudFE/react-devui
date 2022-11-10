import type { DBreadcrumbItem } from '@react-devui/ui/components/breadcrumb';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { DBreadcrumb } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

export interface AppRouteHeaderBreadcrumbProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aList: DBreadcrumbItem<string>[];
  aHome?: DBreadcrumbItem<string>;
  aSeparator?: React.ReactNode;
}

export function AppRouteHeaderBreadcrumb(props: AppRouteHeaderBreadcrumbProps): JSX.Element | null {
  const {
    aList,
    aHome,
    aSeparator,

    ...restProps
  } = props;

  const { t } = useTranslation();

  const home: DBreadcrumbItem<string> = aHome ?? {
    id: '/',
    title: t('Home', { ns: 'title' }),
    link: true,
  };

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-route-header__breadcrumb')}>
      <DBreadcrumb
        dList={[home].concat(aList).map((item) => ({
          ...item,
          title: item.link ? (
            <Link className="app-route-header__breadcrumb-link" to={item.id}>
              {item.title}
            </Link>
          ) : (
            item.title
          ),
        }))}
        dSeparator={aSeparator}
      />
    </div>
  );
}
