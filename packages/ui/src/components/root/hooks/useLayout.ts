import { useRefExtra } from '@react-devui/hooks';

import { useContextRequired } from '../../../hooks';
import { DConfigContext } from '../contex';

export function useLayout() {
  const { pageScrollEl, contentResizeEl } = useContextRequired(DConfigContext).layout;

  const dPageScrollRef = useRefExtra(pageScrollEl ?? (() => null));
  const dContentResizeRef = useRefExtra(contentResizeEl ?? (() => null));

  return { dPageScrollRef, dContentResizeRef };
}
