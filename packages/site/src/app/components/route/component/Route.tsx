import type { DLang } from '@react-devui/ui/utils/types';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useStorage } from '@react-devui/hooks';
import { DCustomIcon } from '@react-devui/icons';

import { AppRoute as AppMdRoute } from '../md/Route';
import marked, { toString } from '../utils';
import { BASE64_DATA } from './base64.out';

export interface AppRouteProps {
  title: string;
  subtitle: string;
  description: number[];
  aria: string;
  compose: string;
  'virtual-scroll': string;
  api: number[];
  demos: React.ReactNode;
  links: { href: string; title: string }[];
}

export function AppRoute(props: AppRouteProps): JSX.Element | null {
  const { title, subtitle, aria, compose, 'virtual-scroll': virtualScroll, demos, links } = props;

  const description = marked(toString(props.description));
  const api = marked(toString(props.api));

  const { t } = useTranslation();
  const languageStorage = useStorage<DLang>('language', 'en-US');

  useEffect(() => {
    document.title = title + (languageStorage.value !== 'en-US' ? ` ${subtitle}` : '') + ' - React DevUI';
  }, [languageStorage.value, subtitle, title]);

  // useLayoutEffect(() => {
  //   const descriptionEl = document.querySelector(`meta[name="description"]`);
  //   const description = descriptionEl?.getAttribute('content') ?? '';
  //   descriptionEl?.setAttribute(
  //     'content',
  //     document.querySelector('.app-component-route__description > p:first-child')?.textContent ?? description
  //   );
  //   return () => {
  //     descriptionEl?.setAttribute('content', description);
  //   };
  // }, [i18n.language]);

  return (
    <AppMdRoute links={links}>
      <h1 id="component-route-title" className="app-component-route__title">
        {title}
        {languageStorage.value !== 'en-US' && <span className="app-component-route__subtitle">{subtitle}</span>}
      </h1>
      <section className="app-component-route__description" dangerouslySetInnerHTML={{ __html: description }} />
      <ul className="app-component-route__tag-list">
        {aria && (
          <li>
            <a
              className="app-component-route__tag-link"
              href={aria.startsWith('http') ? aria : `https://www.w3.org/WAI/ARIA/apg/patterns/${aria}/`}
              target="_blank"
              rel="noreferrer"
            >
              <DCustomIcon viewBox="0 0 24 24" dSize={24}>
                <g>
                  <path
                    d="M6.92 6.1l2.33 7.99 2.32-8h6.3v.8l-2.37 4.14c.83.27 1.46.76 1.89 1.47.43.71.64 1.55.64 2.51 0 1.2-.31 2.2-.94 3a2.93 2.93 0 01-2.42 1.22 2.9 2.9 0 01-1.96-.72 4.25 4.25 0 01-1.23-1.96l1.31-.55c.2.5.45.9.76 1.18.32.28.69.43 1.12.43.44 0 .82-.26 1.13-.76.31-.51.47-1.12.47-1.84 0-.79-.17-1.4-.5-1.83-.38-.5-.99-.76-1.81-.76h-.64v-.78l2.24-3.92h-2.7l-.16.26-3.3 11.25h-.15l-2.4-8.14-2.41 8.14h-.16L.43 6.1H2.1l2.33 7.99L6 8.71 5.24 6.1h1.68z"
                    fill="#005A9C"
                  ></path>
                  <g>
                    <path d="M23.52 6.25l.28 1.62-.98 1.8s-.38-.76-1.01-1.19c-.53-.35-.87-.43-1.41-.33-.7.14-1.48.93-1.82 1.9-.41 1.18-.42 1.74-.43 2.26a4.9 4.9 0 00.11 1.33s-.6-1.06-.59-2.61c0-1.1.19-2.11.72-3.1.47-.87 1.17-1.4 1.8-1.45.63-.07 1.14.23 1.53.55.42.33.83 1.07.83 1.07l.97-1.85zM23.64 15.4s-.43.75-.7 1.04c-.27.28-.76.79-1.36 1.04-.6.25-.91.3-1.5.25a3.03 3.03 0 01-1.34-.52 5.08 5.08 0 01-1.67-2.04s.24.75.39 1.07c.09.18.36.74.74 1.23a3.5 3.5 0 002.1 1.42c1.04.18 1.76-.27 1.94-.38a5.32 5.32 0 001.4-1.43c.1-.14.25-.43.25-.43l-.25-1.25z"></path>
                  </g>
                </g>
              </DCustomIcon>
              <span>WAI-ARIA</span>
            </a>
          </li>
        )}
        {compose && (
          <li>
            <Link className="app-component-route__tag-link" to="/components/Compose">
              <img src={`data:image/png;base64,${BASE64_DATA.compose}`} alt="Compose" width={20} height={20} />
              <span>Compose</span>
            </Link>
          </li>
        )}
        {virtualScroll && (
          <li>
            <Link className="app-component-route__tag-link" to="/components/VirtualScroll">
              <img src={`data:image/png;base64,${BASE64_DATA['virtual-scroll']}`} alt="VirtualScroll" width={16} height={16} />
              <span>VirtualScroll</span>
            </Link>
          </li>
        )}
      </ul>
      <h2 id="component-route-examples" className="app-component-route__examples-title">
        {t('Examples')}
      </h2>
      <section className="app-component-route__demos" data-demo={title}>
        {demos}
      </section>
      <section className="app-component-route__api" dangerouslySetInnerHTML={{ __html: api }} />
    </AppMdRoute>
  );
}
