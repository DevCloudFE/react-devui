import { useEvent, useRefExtra } from '@react-devui/hooks';

import { useContextRequired } from '../../../hooks';
import { DConfigContext } from '../contex';

export function useGlobalScroll(cb?: () => void, disabled = false) {
  const windowRef = useRefExtra(() => window);
  const globalScroll = useContextRequired(DConfigContext).globalScroll;

  useEvent(windowRef, 'scroll', cb, { passive: true, capture: true }, !globalScroll || disabled);

  return globalScroll;
}
