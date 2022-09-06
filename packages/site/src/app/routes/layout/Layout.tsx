import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AppHeader } from './Header';
import { AppSidebar } from './Sidebar';

export default function Layout(): JSX.Element | null {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <AppHeader menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
      <AppSidebar menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
    </>
  );
}
