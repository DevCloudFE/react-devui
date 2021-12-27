import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { DTooltip, DIcon } from '@react-devui/ui';

import { AppRouteArticle } from '../RouteArticle';
import marked, { toString } from '../utils';
import './ComponentRouteArticle.scss';

export interface AppComponentRouteArticleProps {
  title: string;
  subtitle: string;
  description: number[];
  api: number[];
  demos: React.ReactNode;
  links: Array<{ href: string; title: string }>;
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

  useEffect(() => {
    const descriptionEl = document.querySelector(`meta[name="description"]`);
    const _description = descriptionEl?.getAttribute('content') ?? '';
    descriptionEl?.setAttribute(
      'content',
      document.querySelector('.app-component-route-article__description > p:first-child')?.textContent ?? _description
    );
    return () => {
      descriptionEl?.setAttribute('content', _description);
    };
  }, [i18n.language]);

  return (
    <AppRouteArticle links={links}>
      <h1 id="title" className="app-component-route-article__title">
        {title}
        {i18n.language !== 'en-US' && <span className="app-component-route-article__subtitle">{subtitle}</span>}
        <DTooltip dTitle={t('Edit this page on GitHub')}>
          <DIcon className="app-icon-button" style={{ marginLeft: 4 }} viewBox="64 64 896 896" role="button" dSize={20}>
            <path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"></path>
          </DIcon>
        </DTooltip>
      </h1>
      <section className="app-component-route-article__description" dangerouslySetInnerHTML={{ __html: description }} />
      <h2 id="Examples" className="app-component-route-article__examples">
        {t('Examples')}
        <DTooltip dTitle={t('Expand all code')}>
          <DIcon className="app-icon-button" style={{ marginLeft: 4 }} viewBox="64 64 896 896" role="button" dSize={24}>
            <path d="M516 673c0 4.4 3.4 8 7.5 8h185c4.1 0 7.5-3.6 7.5-8v-48c0-4.4-3.4-8-7.5-8h-185c-4.1 0-7.5 3.6-7.5 8v48zm-194.9 6.1l192-161c3.8-3.2 3.8-9.1 0-12.3l-192-160.9A7.95 7.95 0 00308 351v62.7c0 2.4 1 4.6 2.9 6.1L420.7 512l-109.8 92.2a8.1 8.1 0 00-2.9 6.1V673c0 6.8 7.9 10.5 13.1 6.1zM880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path>
          </DIcon>
        </DTooltip>
      </h2>
      <section className="app-component-route-article__demos">{demos}</section>
      <section className="app-component-route-article__api" dangerouslySetInnerHTML={{ __html: api }} />
    </AppRouteArticle>
  );
}
