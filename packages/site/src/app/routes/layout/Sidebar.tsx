import type { DMenuItem } from '@react-devui/ui/components/menu';
import type { DLang } from '@react-devui/ui/hooks/i18n';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import menu from 'packages/site/dist/menu.json';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { useLocalStorage } from '@react-devui/hooks';
import { AppstoreOutlined, BookOutlined, RightOutlined } from '@react-devui/icons';
import { DDrawer, DMenu } from '@react-devui/ui';
import { useMediaQuery } from '@react-devui/ui/hooks';

export interface AppSidebarProps {
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function AppSidebar(props: AppSidebarProps): JSX.Element | null {
  const { menuOpen, onMenuOpenChange } = props;

  const { t } = useTranslation();
  const [language] = useLocalStorage<DLang>('language', 'en-US');
  const breakpointsMatched = useMediaQuery();

  const location = useLocation();
  const page = location.pathname.startsWith('/docs') ? 'Docs' : location.pathname.startsWith('/components') ? 'Components' : null;
  const regex = new RegExp(String.raw`(?<=^\/${page === 'Docs' ? 'docs' : 'components'}\/).+$`);
  const activeId = location.pathname.match(regex)?.[0] ?? null;

  const menuNode = (
    <DMenu
      className="app-layout-sidebar__menu"
      dList={
        page === 'Docs'
          ? ([
              {
                id: 'Overview',
                title: (
                  <Link tabIndex={-1} to="/docs/Overview">
                    {t('docs-menu.Overview')}
                  </Link>
                ),
                type: 'item',
              },
              {
                id: 'GettingStarted',
                title: (
                  <Link tabIndex={-1} to="/docs/GettingStarted">
                    {t('docs-menu.Getting Started')}
                  </Link>
                ),
                type: 'item',
              },
              {
                id: 'DynamicTheme',
                title: (
                  <Link tabIndex={-1} to="/docs/DynamicTheme">
                    {t('docs-menu.Dynamic Theme')}
                  </Link>
                ),
                type: 'item',
              },
              {
                id: 'Internationalization',
                title: (
                  <Link tabIndex={-1} to="/docs/Internationalization">
                    {t('docs-menu.Internationalization')}
                  </Link>
                ),
                type: 'item',
              },
            ] as DMenuItem<string>[])
          : menu.map<DMenuItem<string>>((group) => ({
              id: group.title,
              title: t(`menu.components-group.${group.title}`),
              type: 'group',
              children: (group.title === 'Other'
                ? group.children.concat([{ title: 'Interface', to: '/components/Interface' }])
                : group.children
              ).map<DMenuItem<string>>((child) => ({
                id: child.title,
                title: (
                  <Link tabIndex={-1} to={child.to}>
                    {child.title}
                    {language !== 'en-US' && (
                      <span className="app-layout-sidebar__menu-subtitle">{t(`menu.components.${child.title}`)}</span>
                    )}
                  </Link>
                ),
                type: 'item',
              })),
            }))
      }
      dActive={activeId}
    ></DMenu>
  );

  return breakpointsMatched.includes('md') ? (
    page ? (
      <div className="app-layout-sidebar">{menuNode}</div>
    ) : null
  ) : (
    <DDrawer
      className="app-layout-sidebar__drawer"
      dVisible={menuOpen}
      dHeader={
        <DDrawer.Header>
          <Link className="app-layout-sidebar__header-logo" to="/">
            <img src="/assets/logo.svg" alt="Logo" width="24" height="24" />
            <span>DevUI</span>
          </Link>
        </DDrawer.Header>
      }
      dWidth={280}
      onVisibleChange={onMenuOpenChange}
    >
      <div className="app-layout-sidebar__button-container">
        <Link className="app-layout-sidebar__link-button" to="/docs">
          <BookOutlined />
          {t('Docs')}
          <RightOutlined />
        </Link>
        <Link className="app-layout-sidebar__link-button" to="/components">
          <AppstoreOutlined />
          {t('Components')}
          <RightOutlined />
        </Link>
      </div>

      {page && menuNode}
    </DDrawer>
  );
}
