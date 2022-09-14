import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useDeviceQuery } from '../../hooks';
import { AppSidebar } from './Sidebar';
import { AppHeader } from './header/Header';

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

  const deviceMatched = useDeviceQuery();
  const [menuOpen, setMenuOpen] = useState(deviceMatched === 'desktop');

  return (
    <>
      <AppHeader sidebarWidth={sidebar?.width ?? SIDEBAR_DEFAULT.width} menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
      <AppSidebar menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
      <main
        className="app-layout__main"
        style={{ width: deviceMatched === 'phone' ? '100%' : menuOpen ? 'calc(100% - 200px)' : 'calc(100% - 64px)' }}
      >
        <Outlet />
      </main>
    </>
  );
}
