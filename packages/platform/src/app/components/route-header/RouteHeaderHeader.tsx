import { nth } from 'lodash';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeftOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { RouteStateContext } from '../../Routes';

export interface AppRouteHeaderHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  aBack?: boolean;
  aActions?: React.ReactNode[];
}

export function AppRouteHeaderHeader(props: AppRouteHeaderHeaderProps): JSX.Element | null {
  const {
    children,
    aBack = false,
    aActions,

    ...restProps
  } = props;

  const { matchRoutes } = useContext(RouteStateContext);

  const navigate = useNavigate();

  const title = (() => {
    if (matchRoutes) {
      const { title } = nth(matchRoutes, -1)!.route.data ?? {};
      return title;
    }
    return undefined;
  })();

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-route-header__header')}>
      <div className="app-route-header__header-title-container">
        {aBack && (
          <button className="app-route-header__header-back">
            <ArrowLeftOutlined
              onClick={() => {
                navigate(-1);
              }}
              dSize={20}
            />
          </button>
        )}
        <div className="app-route-header__header-title">{children ?? title}</div>
      </div>
      <div className="app-route-header__header-actions">{React.Children.map(aActions, (c) => c)}</div>
    </div>
  );
}
