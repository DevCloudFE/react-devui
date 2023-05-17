import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { getClassName } from '@react-devui/utils';

import { AppHeader } from './header/Header';
import { AppSidebar } from './sidebar/Sidebar';

import styles from './Layout.module.scss';

export interface AppLayoutProps {
  sidebar?: {
    width?: number;
  };
}

const SIDEBAR_DEFAULT = {
  width: 200,
};

export default function Layout(props: AppLayoutProps): JSX.Element | null {
  const { sidebar } = props;

  const [menuMode, setMenuMode] = useState<'vertical' | 'icon'>('vertical');
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <AppHeader
        sidebarWidth={sidebar?.width ?? SIDEBAR_DEFAULT.width}
        menuMode={menuMode}
        menuOpen={menuOpen}
        onMenuModeChange={setMenuMode}
        onMenuOpenChange={setMenuOpen}
      />
      <section className={getClassName(styles['app-layout'], styles[`app-layout--menu-${menuMode}`])}>
        <AppSidebar menuMode={menuMode} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
        <main id="app-main" className={styles['app-layout__content']}>
          <section id="app-content">
            <Outlet />
          </section>
        </main>
      </section>
    </>
  );
}
