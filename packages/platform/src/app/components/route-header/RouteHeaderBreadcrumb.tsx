import type { DBreadcrumbItem } from '@react-devui/ui/components/breadcrumb';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { DBreadcrumb } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

type BreadcrumbItem = DBreadcrumbItem<string> & { skipRenderLink?: boolean };

export interface AppRouteHeaderBreadcrumbProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aList: BreadcrumbItem[];
  aHome?: BreadcrumbItem;
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

  const home: BreadcrumbItem = aHome ?? {
    id: '/',
    title: t('Home', { ns: 'title' }),
    link: true,
  };

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-route-header__breadcrumb')}>
      <DBreadcrumb
        dList={[home].concat(aList).map((item) => ({
          ...item,
          title:
            item.link && !item.skipRenderLink ? (
              <Link className="app-route-header__breadcrumb-link" to={item.id}>
                {item.title}
              </Link>
            ) : React.isValidElement(item.title) ? (
              React.cloneElement<React.HTMLAttributes<HTMLElement>>(item.title as any, {
                className: getClassName(
                  item.title.props.className,
                  item.title.type === Link ? 'app-route-header__breadcrumb-link' : 'app-route-header__breadcrumb-item'
                ),
              })
            ) : (
              <div className="app-route-header__breadcrumb-item">{item.title}</div>
            ),
        }))}
        dSeparator={aSeparator}
      />
    </div>
  );
}
