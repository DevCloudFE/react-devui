import { nth } from 'lodash';

import { getClassName } from '@react-devui/utils';

import { useTitle } from './hooks';

export interface AppRouteHeaderHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  aActions?: React.ReactNode[];
}

export function AppRouteHeaderHeader(props: AppRouteHeaderHeaderProps): JSX.Element | null {
  const {
    children,
    aActions,

    ...restProps
  } = props;

  const titles = useTitle();

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-route-header__header')}>
      <div className="app-route-header__header-title">{children ?? nth(titles, -1)?.[1]}</div>
      <div className="app-route-header__header-actions">{aActions}</div>
    </div>
  );
}
