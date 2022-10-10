import type { AppRouteProps } from './Route';
import type { DLang } from '@react-devui/ui/utils/types';

import React from 'react';

import { useStorage } from '@react-devui/hooks';

import { AppRoute } from './Route';

export interface AppComponentRouteProps {
  'en-US': AppRouteProps;
  'zh-CN': AppRouteProps;
}

export function AppComponentRoute(props: AppComponentRouteProps): JSX.Element | null {
  const languageStorage = useStorage<DLang>('language', 'en-US');

  return React.createElement(AppRoute, props[languageStorage.value]);
}
