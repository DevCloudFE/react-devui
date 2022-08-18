import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AppHeader } from './header';
import { AppSidebar } from './sidebar';

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <AppHeader aMenuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
      <AppSidebar aMenuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
    </>
  );
}
