import { isUndefined } from 'lodash';
import { Navigate } from 'react-router-dom';

import { LOGIN_PATH } from '../config/other';
import { useMenu } from '../core';

export default function Home(): JSX.Element | null {
  const [{ firstCanActive }] = useMenu();

  return <Navigate to={isUndefined(firstCanActive) ? LOGIN_PATH : firstCanActive.path} replace />;
}
