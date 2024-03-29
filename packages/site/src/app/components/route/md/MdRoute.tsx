import type { AppRouteProps } from './Route';
import type { DLang } from '@react-devui/ui/utils/types';

import { useStorage } from '@react-devui/hooks';

import { AppRoute } from './Route';

export interface AppMdRouteProps {
  'en-US': AppRouteProps;
  'zh-CN': AppRouteProps;
}

export function AppMdRoute(props: AppMdRouteProps): JSX.Element | null {
  const languageStorage = useStorage<DLang>('language', 'en-US');

  return <AppRoute {...props[languageStorage.value]} />;
}
