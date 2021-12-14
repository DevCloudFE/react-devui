import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { DDrawer, DDrawerHeader, DMenu, DMenuGroup, DMenuItem, DRow } from '@react-devui/ui';
import { useCustomContext, useImmer } from '@react-devui/ui/hooks';

import { AppContext } from '../../App';
import menu from '../../configs/menu.json';
import './Sidebar.scss';

export function AppSidebar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [{ menuOpen = false, pageMounted, onMenuOpenChange }] = useCustomContext(AppContext);

  const [activeId, setActiveId] = useImmer<string | null>(null);

  useEffect(() => {
    if (pageMounted && window.location.href.includes(String.raw`/components/`)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const to = window.location.href.match(/\/components\/[a-zA-Z]+/)![0];
      menu.forEach((group) => {
        const child = group.children.find((child) => child.to === to);
        if (child) {
          setActiveId(child.title);
        }
      });

      if (to === '/components/Interface') {
        setActiveId('Interface');
      }
    }
  }, [pageMounted, setActiveId]);

  const menuNode = (
    <DMenu dActive={[activeId, setActiveId]} onActiveChange={() => onMenuOpenChange?.(false)}>
      {menu.map((group) => (
        <DMenuGroup key={group.title} dId={group.title} dTitle={t(`menu-group.${group.title}`)}>
          {group.title === 'Other' ? (
            <DMenuItem key="Interface" dId="Interface" onClick={() => navigate('/components/Interface', { replace: true })}>
              Interface
              {i18n.language !== 'en-US' && <span className="app-sidebar__subtitle">{t(`Documentation.Interface`)}</span>}
            </DMenuItem>
          ) : (
            group.children.map((child) => (
              <DMenuItem key={child.title} dId={child.title} onClick={() => navigate(child.to, { replace: true })}>
                {child.title}
                {i18n.language !== 'en-US' && <span className="app-sidebar__subtitle">{t(`menu.${child.title}`)}</span>}
              </DMenuItem>
            ))
          )}
        </DMenuGroup>
      ))}
    </DMenu>
  );

  return (
    <DRow
      dAsListener
      dRender={(match, matchs) =>
        matchs.includes('md') ? (
          <nav className="app-sidebar">{menuNode}</nav>
        ) : (
          <DDrawer
            className="app-sidebar__drawer"
            dVisible={[menuOpen]}
            dHeader={
              <DDrawerHeader>
                <img className="app-sidebar__logo" src="/assets/logo.svg" alt="Logo" width="24" height="24" />
                <span className="app-sidebar__title">DevUI</span>
              </DDrawerHeader>
            }
            dWidth={280}
            onClose={() => onMenuOpenChange?.(false)}
          >
            {menuNode}
          </DDrawer>
        )
      }
    ></DRow>
  );
}
