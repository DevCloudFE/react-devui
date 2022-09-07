import type { AppRouteProps } from './Route';
import type { DLang } from '@react-devui/ui/hooks/i18n';

import React from 'react';

import { useLocalStorage } from '@react-devui/hooks';

import { AppRoute } from './Route';

export interface AppComponentRouteProps {
  'en-US': AppRouteProps;
  'zh-CN': AppRouteProps;
}

export function AppComponentRoute(props: AppComponentRouteProps): JSX.Element | null {
  const [language] = useLocalStorage<DLang>('language', 'en-US');

  return React.createElement(AppRoute, props[language]);
}
