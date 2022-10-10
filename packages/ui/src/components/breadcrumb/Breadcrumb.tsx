import type { DId } from '../../utils/types';

import React from 'react';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DBreadcrumbItem<ID extends DId> {
  id: ID;
  title: React.ReactNode;
  link?: boolean;
  separator?: React.ReactNode;
}

export interface DBreadcrumbProps<ID extends DId, T extends DBreadcrumbItem<ID>>
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dList: T[];
  dSeparator?: React.ReactNode;
  onItemClick?: (id: T['id'], item: T) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DBreadcrumb' as const });
export function DBreadcrumb<ID extends DId, T extends DBreadcrumbItem<ID>>(props: DBreadcrumbProps<ID, T>): JSX.Element | null {
  const {
    dList,
    dSeparator,
    onItemClick,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <nav {...restProps} className={getClassName(restProps.className, `${dPrefix}breadcrumb`)}>
      <ol className={`${dPrefix}breadcrumb__list`}>
        {dList.map((item, index) => (
          <React.Fragment key={item.id}>
            <li
              className={getClassName(`${dPrefix}breadcrumb__item`, {
                [`${dPrefix}breadcrumb__item--link`]: item.link,
                [`${dPrefix}breadcrumb__item--last`]: index === dList.length - 1,
              })}
              onClick={() => {
                onItemClick?.(item.id, item);
              }}
            >
              {item.title}
            </li>
            {index !== dList.length - 1 && (
              <li className={`${dPrefix}breadcrumb__separator`} aria-hidden>
                {item.separator ?? dSeparator ?? '/'}
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
