import { isUndefined } from 'lodash';
import { Navigate } from 'react-router-dom';

import { useMenu } from '../../core';

export default function Home(): JSX.Element | null {
  const [{ firstPath }] = useMenu();

  return isUndefined(firstPath) ? null : <Navigate to={firstPath} replace />;
}
