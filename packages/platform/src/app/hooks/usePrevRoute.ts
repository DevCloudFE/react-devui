import type { PREV_ROUTE_KEY } from '../../config/other';

import { useLocation } from 'react-router-dom';

export function usePrevRoute() {
  const location = useLocation();
  const from = (location.state as null | { [PREV_ROUTE_KEY]?: Location })?.from?.pathname || '/';
  return from;
}
