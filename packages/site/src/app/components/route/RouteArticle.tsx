import { useTranslation } from 'react-i18next';

import { DTooltip, DIcon, DAnchor, DAnchorLink, DRow } from '@react-devui/ui';
import { DTransition } from '@react-devui/ui/components/_transition';
import { useImmer, useRefCallback } from '@react-devui/ui/hooks';

import './RouteArticle.scss';
import { toString } from './utils';

export interface AppRouteArticleProps {
  title: string;
  subtitle: string;
  description: number[];
  api: number[];
  demos: React.ReactNode;
  links: Array<{ href: string; title: string }>;
}

export function AppRouteArticle(props: AppRouteArticleProps) {
  const { title, subtitle, demos, links } = props;

  const description = toString(props.description);
  const api = toString(props.api);

  const { t, i18n } = useTranslation();

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

  return (
    <DRow
      dAsListener
      dRender={(match, matchs) => (
        <>
          {matchs.includes('md') && (
            <DAnchor className="app-route__anchor" dPage=".app-main">
              {links &&
                links.map((link) => (
                  <DAnchorLink key={link.href} href={link.href} title={link.title}>
                    {link.title}
                  </DAnchorLink>
                ))}
              <DAnchorLink href="#API">API</DAnchorLink>
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
                dRender={(hidden) => (
                  <div ref={ref} className="app-route__anchor-conatiner" style={{ visibility: hidden ? 'hidden' : undefined }}>
                    <DAnchor dPage=".app-main" dIndicator="line">
                      {links &&
                        links.map((link) => (
                          <DAnchorLink key={link.href} href={link.href} title={link.title} onClick={() => setMenuOpen(false)}>
                            {link.title}
                          </DAnchorLink>
                        ))}
                      <DAnchorLink href="#API" onClick={() => setMenuOpen(false)}>
                        API
                      </DAnchorLink>
                    </DAnchor>
                  </div>
                )}
              ></DTransition>

              <div className="app-route__anchor-button" role="button" tabIndex={0} onClick={() => setMenuOpen(!menuOpen)}>
                {icon(true)}
                {icon(false)}
              </div>
            </>
          )}

          <article className="app-route-article">
            <h1 id="title">
              {title}
              {i18n.language !== 'en-US' && <span className="app-route-article__subtitle">{subtitle}</span>}
              <DTooltip dTitle={t('Edit this page on GitHub')}>
                <DIcon className="icon-button" style={{ marginLeft: 4 }} dSize={20}>
                  <path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"></path>
                </DIcon>
              </DTooltip>
            </h1>
            <section className="app-route-article__description" dangerouslySetInnerHTML={{ __html: description }} />
            <h2 id="Examples">
              {t('Examples')}
              <DTooltip dTitle={t('Expand all code')}>
                <DIcon className="icon-button" style={{ marginLeft: 4 }} dSize={24}>
                  <path d="M516 673c0 4.4 3.4 8 7.5 8h185c4.1 0 7.5-3.6 7.5-8v-48c0-4.4-3.4-8-7.5-8h-185c-4.1 0-7.5 3.6-7.5 8v48zm-194.9 6.1l192-161c3.8-3.2 3.8-9.1 0-12.3l-192-160.9A7.95 7.95 0 00308 351v62.7c0 2.4 1 4.6 2.9 6.1L420.7 512l-109.8 92.2a8.1 8.1 0 00-2.9 6.1V673c0 6.8 7.9 10.5 13.1 6.1zM880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path>
                </DIcon>
              </DTooltip>
            </h2>
            <section className="app-route-article__demos">{demos}</section>
            <section className="app-route-article__api" dangerouslySetInnerHTML={{ __html: api }} />
          </article>
        </>
      )}
    ></DRow>
  );
}
