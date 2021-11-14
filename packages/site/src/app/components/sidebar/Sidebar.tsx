import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useImmer } from 'use-immer';

import { DMenu, DMenuGroup, DMenuItem } from '@react-devui/ui';

import menu from '../../configs/menu.json';
import './Sidebar.scss';

export function AppSidebar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [activeId, setActiveId] = useImmer<string | undefined>(undefined);

  const handleActiveChange = useCallback(
    (id) => {
      setActiveId(id);
    },
    [setActiveId]
  );

  useEffect(() => {
    if (window.location.href.includes(String.raw`/components/`)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const to = window.location.href.match(/\/components\/[a-zA-Z]+/)![0];
      menu.forEach((group) => {
        const child = group.children.find((child) => child.to === to);
        if (child) {
          setActiveId(child.title);
        }
      });
    }
  }, [setActiveId]);

  return (
    <nav className="app-sidebar">
      <DMenu dActive={activeId} onActiveChange={handleActiveChange}>
        {menu.map((group) => (
          <DMenuGroup key={group.title} dId={group.title} dTitle={t(`menu-group.${group.title}`)}>
            {group.children.map((child) => (
              <DMenuItem key={child.title} dId={child.title} onClick={() => navigate(child.to, { replace: true })}>
                {child.title}
                {i18n.language !== 'en-US' && <span className="app-sidebar__subtitle">{t(`menu.${child.title}`)}</span>}
              </DMenuItem>
            ))}
          </DMenuGroup>
        ))}
      </DMenu>
    </nav>
  );
}
