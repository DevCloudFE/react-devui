import { useBreakpoints } from '@react-devui/hooks';

import { useGridConfig } from './d-config';

export function useMediaQuery() {
  const { dBreakpoints } = useGridConfig();

  return useBreakpoints(dBreakpoints);
}
