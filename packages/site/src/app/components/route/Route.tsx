import type { AppRouteArticleProps } from './RouteArticle';

import { useTranslation } from 'react-i18next';

import { AppRouteArticle } from './RouteArticle';

export function AppRoute(props: { 'en-US': AppRouteArticleProps; 'zh-Hant': AppRouteArticleProps }) {
  const { i18n } = useTranslation();

  return <AppRouteArticle {...props[i18n.language]} />;
}
