import type { DMenuOption } from '@react-devui/ui/components/menu';
import type { DNestedChildren } from '@react-devui/ui/utils/global';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { DDrawer, DDrawerHeader, DMenu, useMediaMatch } from '@react-devui/ui';
import { useMount } from '@react-devui/ui/hooks';

import menu from '../../../configs/menu.json';
import './Sidebar.scss';

export function AppSidebar(props: { aMenuOpen: boolean; onMenuOpenChange: (open: boolean) => void }) {
  const { aMenuOpen, onMenuOpenChange } = props;

  const { t, i18n } = useTranslation();

  const [activeId, setActiveId] = useState<string | null>(null);

  useMount(() => {
    if (window.location.href.includes(String.raw`/components/`)) {
      const to = window.location.href.match(/\/components\/[a-zA-Z]+/)?.[0];
      if (to) {
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
    }
  });

  const menuNode = (
    <DMenu
      className="app-sidebar__menu"
      dOptions={menu.map<DNestedChildren<DMenuOption<string> & { to?: string }>>((group) => ({
        id: group.title,
        title: t(`menu-group.${group.title}`),
        type: 'group',
        children:
          group.title === 'Other'
            ? [
                {
                  id: 'Interface',
                  title: (
                    <Link to="/components/Interface">
                      Interface{i18n.language !== 'en-US' && <span className="app-sidebar__subtitle">{t(`Documentation.Interface`)}</span>}
                    </Link>
                  ),
                  type: 'item',
                },
              ]
            : group.children.map((child) => ({
                id: child.title,
                title: (
                  <Link to={child.to}>
                    {child.title}
                    {i18n.language !== 'en-US' && <span className="app-sidebar__subtitle">{t(`menu.${child.title}`)}</span>}
                  </Link>
                ),
                type: 'item',
              })),
      }))}
      dActive={activeId}
      onActiveChange={(id) => {
        setActiveId(id);
        onMenuOpenChange(false);
      }}
    ></DMenu>
  );

  const mediaMatch = useMediaMatch();

  return mediaMatch.includes('md') ? (
    <div className="app-sidebar">{menuNode}</div>
  ) : (
    <DDrawer
      className="app-sidebar__drawer"
      dVisible={aMenuOpen}
      dHeader={
        <DDrawerHeader>
          <img className="app-sidebar__logo" src="/assets/logo.svg" alt="Logo" width="24" height="24" />
          <span className="app-sidebar__title">DevUI</span>
        </DDrawerHeader>
      }
      dWidth={280}
      onVisibleChange={onMenuOpenChange}
    >
      {menuNode}
    </DDrawer>
  );
}
