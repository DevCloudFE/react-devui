import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { AppRouteArticle } from '../RouteArticle';
import marked, { toString } from '../utils';
import './ComponentRouteArticle.scss';

export interface AppComponentRouteArticleProps {
  title: string;
  subtitle: string;
  description: number[];
  api: number[];
  demos: React.ReactNode;
  links: { href: string; title: string }[];
}

export function AppComponentRouteArticle(props: AppComponentRouteArticleProps) {
  const { title, subtitle, demos, links } = props;

  const description = marked(toString(props.description));
  const api = marked(toString(props.api));

  const { t, i18n } = useTranslation();

  useEffect(() => {
    const _title = document.title;
    document.title = title + (i18n.language !== 'en-US' ? ` ${subtitle}` : '') + ' - React DevUI';
    return () => {
      document.title = _title;
    };
  }, [i18n.language, subtitle, title]);

  // useLayoutEffect(() => {
  //   const descriptionEl = document.querySelector(`meta[name="description"]`);
  //   const description = descriptionEl?.getAttribute('content') ?? '';
  //   descriptionEl?.setAttribute(
  //     'content',
  //     document.querySelector('.app-component-route-article__description > p:first-child')?.textContent ?? description
  //   );
  //   return () => {
  //     descriptionEl?.setAttribute('content', description);
  //   };
  // }, [i18n.language]);

  return (
    <AppRouteArticle links={links}>
      <h1 id="title" className="app-component-route-article__title">
        {title}
        {i18n.language !== 'en-US' && <span className="app-component-route-article__subtitle">{subtitle}</span>}
      </h1>
      <section className="app-component-route-article__description" dangerouslySetInnerHTML={{ __html: description }} />
      <h2 id="Examples" className="app-component-route-article__examples">
        {t('Examples')}
      </h2>
      <section className="app-component-route-article__demos" data-demo={title}>
        {demos}
      </section>
      <section className="app-component-route-article__api" dangerouslySetInnerHTML={{ __html: api }} />
    </AppRouteArticle>
  );
}
