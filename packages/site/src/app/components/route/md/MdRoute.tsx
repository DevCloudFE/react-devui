import type { AppRouteProps } from './Route';
import type { DLang } from '@react-devui/ui/hooks/i18n';

import { useLocalStorage } from '@react-devui/hooks';

import { AppRoute } from './Route';

export interface AppMdRouteProps {
  'en-US': AppRouteProps;
  'zh-CN': AppRouteProps;
}

export function AppMdRoute(props: AppMdRouteProps): JSX.Element | null {
  const [language] = useLocalStorage<DLang>('language', 'en-US');

  return <AppRoute {...props[language]} />;
}
