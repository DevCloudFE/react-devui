import type { AppComponentRouteArticleProps } from './ComponentRouteArticle';

import { useTranslation } from 'react-i18next';

import { AppComponentRouteArticle } from './ComponentRouteArticle';

export function AppComponentRoute(props: { 'en-US': AppComponentRouteArticleProps; 'zh-Hant': AppComponentRouteArticleProps }) {
  const { i18n } = useTranslation();

  return <AppComponentRouteArticle {...props[i18n.language]} />;
}
