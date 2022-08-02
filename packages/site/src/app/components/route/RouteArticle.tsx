import type { DTransitionState } from '@react-devui/ui/components/_transition';

import { isString, isUndefined } from 'lodash';
import { useEffect, useLayoutEffect, useState } from 'react';

import { DAnchor, useMediaMatch } from '@react-devui/ui';
import { DTransition } from '@react-devui/ui/components/_transition';
import { useImmer } from '@react-devui/ui/hooks';
import { DCustomIcon } from '@react-devui/ui/icons';
import { TTANSITION_DURING_BASE } from '@react-devui/ui/utils/global';

import './RouteArticle.scss';
import marked, { toString } from './utils';

export interface AppRouteArticleProps {
  html?: number[];
  links?: { title: string; href: string }[];
  children?: React.ReactNode;
}

export function AppRouteArticle(props: AppRouteArticleProps) {
  const html = props.html ? marked(toString(props.html)) : undefined;

  const mediaMatch = useMediaMatch();

  const [_links, setLinks] = useImmer<{ title: string; href: string }[]>([]);
  const links = isUndefined(props.links) ? _links : [...props.links, { title: 'API', href: '#API' }];

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
      const arr: { title: string; href: string }[] = [];
      document.querySelectorAll('.app-route-article h2').forEach((el) => {
        arr.push({ title: el.id, href: `#${el.id}` });
      });
      setLinks(arr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isString(html)) {
      const el = document.querySelector(`.app-route-article > h1:first-child`);
      const title = document.title;
      document.title = el?.id + ' - React DevUI';
      return () => {
        document.title = title;
      };
    }
  }, [html]);

  const transitionStyles: Partial<Record<DTransitionState, React.CSSProperties>> = {
    enter: { opacity: 0, transform: 'translateY(120px)' },
    entering: {
      transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
    },
    leaving: {
      opacity: 0,
      transform: 'translateY(120px)',
      transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
    },
    leaved: { display: 'none' },
  };

  return (
    <>
      {mediaMatch.includes('md') && links.length > 0 && <DAnchor className="app-route-article__anchor" dList={links} dPage=".app-main" />}
      {!mediaMatch.includes('md') && (
        <>
          {links.length > 0 && (
            <DTransition dIn={menuOpen} dDuring={TTANSITION_DURING_BASE}>
              {(state) => (
                <div className="app-route-article__anchor-conatiner" style={transitionStyles[state]}>
                  <DAnchor dList={links} dPage=".app-main" dIndicator={DAnchor.LINE_INDICATOR} onItemClick={() => setMenuOpen(false)} />
                </div>
              )}
            </DTransition>
          )}
          <button className="app-route-article__anchor-button" onClick={() => setMenuOpen(!menuOpen)}>
            {icon(true)}
            {icon(false)}
          </button>
        </>
      )}

      <article className="app-route-article" dangerouslySetInnerHTML={html ? { __html: html } : undefined}>
        {props.children}
      </article>
    </>
  );
}
