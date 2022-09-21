import { getClassName } from '@react-devui/utils';

import { AppRouteHeaderBreadcrumb } from './RouteHeaderBreadcrumb';
import { AppRouteHeaderHeader } from './RouteHeaderHeader';

export interface AppRouteHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  aBreadcrumb?: boolean | React.ReactElement;
  aTitle?: React.ReactNode;
  aFixed?: boolean;
}

export const AppRouteHeader: {
  (props: AppRouteHeaderProps): JSX.Element | null;
  Breadcrumb: typeof AppRouteHeaderBreadcrumb;
  Header: typeof AppRouteHeaderHeader;
} = (props) => {
  const {
    children,

    ...restProps
  } = props;

  return (
    <div {...restProps} className={getClassName(restProps.className, 'app-route-header')}>
      {children}
    </div>
  );
};

AppRouteHeader.Breadcrumb = AppRouteHeaderBreadcrumb;
AppRouteHeader.Header = AppRouteHeaderHeader;
