import { useEffect } from 'react';

import { DIcon, DAnchor, DAnchorLink, DRow } from '@react-devui/ui';
import { DTransition } from '@react-devui/ui/components/_transition';
import { useImmer, useRefCallback } from '@react-devui/ui/hooks';

import './RouteArticle.scss';
import { toString } from './component/utils';

export interface AppRouteArticleProps {
  html: number[];
}

export function AppRouteArticle(props: AppRouteArticleProps) {
  const html = toString(props.html);

  const [links, setLinks] = useImmer<Array<{ href: string; title: string }>>([]);
  const [menuOpen, setMenuOpen] = useImmer(false);
  const [el, ref] = useRefCallback();

  const icon = (top: boolean) => (
    <DIcon
      dRotate={top ? 180 : undefined}
      style={{
        transform: menuOpen ? (top ? 'translateY(12px)' : 'translateY(-12px)') : undefined,
        transition: 'transform 0.2s ease',
      }}
      viewBox="0 0 926.23699 573.74994"
    >
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
    </DIcon>
  );

  const transitionState = {
    'enter-from': { opacity: '0', transform: 'translateY(120px)' },
    'enter-to': { transition: 'opacity 0.2s linear, transform 0.2s ease-out' },
    'leave-to': { opacity: '0', transform: 'translateY(120px)', transition: 'opacity 0.2s linear, transform 0.2s ease-out' },
  };

  useEffect(() => {
    const arr: Array<{ href: string; title: string }> = [];
    document.querySelectorAll('.app-route-article h2').forEach((el) => {
      arr.push({ href: '#' + el.id, title: el.id });
    });
    setLinks(arr);
    return () => {
      setLinks([]);
    };
  }, [setLinks]);

  return (
    <DRow
      dAsListener
      dRender={(match, matchs) => (
        <>
          {matchs.includes('md') && links.length > 0 && (
            <DAnchor className="app-component-route-article__anchor" dPage=".app-main">
              {links.map((link) => (
                <DAnchorLink key={link.href} href={link.href} title={link.title}>
                  {link.title}
                </DAnchorLink>
              ))}
            </DAnchor>
          )}
          {!matchs.includes('md') && (
            <>
              <DTransition
                dEl={el}
                dVisible={menuOpen}
                dCallbackList={{
                  beforeEnter: () => transitionState,
                  beforeLeave: () => transitionState,
                }}
                dRender={(hidden) =>
                  links.length > 0 && (
                    <div
                      ref={ref}
                      className="app-component-route-article__anchor-conatiner"
                      style={{ visibility: hidden ? 'hidden' : undefined }}
                    >
                      <DAnchor dPage=".app-main" dIndicator="line">
                        {links.map((link) => (
                          <DAnchorLink key={link.href} href={link.href} title={link.title} onClick={() => setMenuOpen(false)}>
                            {link.title}
                          </DAnchorLink>
                        ))}
                      </DAnchor>
                    </div>
                  )
                }
              ></DTransition>

              <div className="app-component-route-article__anchor-button" role="button" tabIndex={0} onClick={() => setMenuOpen(!menuOpen)}>
                {icon(true)}
                {icon(false)}
              </div>
            </>
          )}

          <article className="app-route-article" dangerouslySetInnerHTML={html ? { __html: html } : undefined}></article>
        </>
      )}
    ></DRow>
  );
}
