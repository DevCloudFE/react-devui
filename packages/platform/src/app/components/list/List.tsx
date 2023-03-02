import React from 'react';

import { DSeparator } from '@react-devui/ui';
import { checkNodeExist, getClassName } from '@react-devui/utils';

export interface AppListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  aList: {
    avatar?: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    description?: React.ReactNode;
    props?: React.HTMLAttributes<HTMLLIElement>;
  }[];
  aSeparator?: boolean;
}

export function AppList(props: AppListProps): JSX.Element | null {
  const {
    aList,
    aSeparator = true,

    ...restProps
  } = props;

  return (
    <ul {...restProps} className={getClassName(restProps.className, 'app-list')}>
      {aList.map(({ avatar, title, subtitle, description, props }, index) => (
        <React.Fragment key={index}>
          <li {...props} className={getClassName(props?.className, 'app-list__item')}>
            {checkNodeExist(avatar) && <div className="app-list__avatar">{avatar}</div>}
            <div className="app-list__content">
              {checkNodeExist(title) && <div className="app-list__title">{title}</div>}
              {checkNodeExist(subtitle) && <div className="app-list__subtitle">{subtitle}</div>}
              {checkNodeExist(description) && <div className="app-list__description">{description}</div>}
            </div>
          </li>
          {aSeparator && index !== aList.length - 1 && <DSeparator style={{ margin: 0 }}></DSeparator>}
        </React.Fragment>
      ))}
    </ul>
  );
}
