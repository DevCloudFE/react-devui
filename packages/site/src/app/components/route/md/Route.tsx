import type { DLang } from '@react-devui/ui/hooks/i18n';

import { isString, isUndefined } from 'lodash';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useImmer, useLocalStorage } from '@react-devui/hooks';
import { DCustomIcon } from '@react-devui/icons';
import { DAnchor, DDrawer } from '@react-devui/ui';
import { useMediaQuery } from '@react-devui/ui/hooks';
import { getClassName } from '@react-devui/utils';

import { AppFooter } from '../../footer';
import marked, { toString } from '../utils';

export interface AppRouteProps {
  html?: number[];
  links?: { title: string; href: string }[];
  children?: React.ReactNode;
}

export function AppRoute(props: AppRouteProps): JSX.Element | null {
  const html = props.html ? marked(toString(props.html)) : undefined;

  const [language] = useLocalStorage<DLang>('language', 'en-US');
  const breakpointsMatched = useMediaQuery();
  const { t } = useTranslation();

  const [_links, setLinks] = useImmer<{ title?: string; href: string }[]>([]);
  const links = isUndefined(props.links) ? _links : [...props.links, { href: 'API' }];

  const [menuOpen, setMenuOpen] = useState(false);

  const icon = (top: boolean) => (
    <div
      style={{
        transform: menuOpen ? `translateY(${top ? '' : '-'}12px)` : undefined,
        transition: 'transform 200ms ease',
      }}
    >
      <DCustomIcon viewBox="0 0 926.23699 573.74994" dRotate={top ? 180 : undefined} dSize={16}>
        <g transform="translate(904.92214,-879.1482)">
          <path
            d="
m -673.67664,1221.6502 -231.2455,-231.24803 55.6165,
-55.627 c 30.5891,-30.59485 56.1806,-55.627 56.8701,-55.627 0.6894,
0 79.8637,78.60862 175.9427,174.68583 l 174.6892,174.6858 174.6892,
-174.6858 c 96.079,-96.07721 175.253196,-174.68583 175.942696,
-174.68583 0.6895,0 26.281,25.03215 56.8701,
55.627 l 55.6165,55.627 -231.245496,231.24803 c -127.185,127.1864
-231.5279,231.248 -231.873,231.248 -0.3451,0 -104.688,
-104.0616 -231.873,-231.248 z
"
          ></path>
        </g>
      </DCustomIcon>
    </div>
  );

  useLayoutEffect(() => {
    if (isUndefined(props.links)) {
      const arr: { href: string }[] = [];
      document.querySelectorAll('.app-md-route h2').forEach((el) => {
        arr.push({ href: el.id });
      });
      setLinks(arr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (isString(html)) {
      const el = document.querySelector(`.app-md-route > h1:first-child`);
      document.title = el?.id + ' - React DevUI';
    }
  }, [html]);

  return (
    <>
      <article
        className={getClassName('app-md-route', {
          'app-md-route--phone': !breakpointsMatched.includes('md'),
        })}
      >
        <section className="app-md-route__content" dangerouslySetInnerHTML={html ? { __html: html } : undefined}>
          {props.children}
        </section>
        <AppFooter />
      </article>
      {breakpointsMatched.includes('md') && links.length > 0 && <DAnchor className="app-md-route__anchor" dList={links} />}
      {!breakpointsMatched.includes('md') && (
        <>
          {links.length > 0 && (
            <DDrawer
              dVisible={menuOpen}
              dHeight="calc(100% - 64px)"
              dZIndex={909}
              dPlacement="bottom"
              dMask={false}
              onVisibleChange={setMenuOpen}
            >
              <DAnchor dList={links} dIndicator={DAnchor.LINE_INDICATOR} onItemClick={() => setMenuOpen(false)} />
            </DDrawer>
          )}
          <button
            className="app-md-route__anchor-toggler"
            aria-label={t(menuOpen ? 'Close anchor navigation' : 'Open anchor navigation')}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {icon(true)}
            {icon(false)}
          </button>
        </>
      )}
    </>
  );
}
