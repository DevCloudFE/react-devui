import { useState } from 'react';

import { AppHeader } from './header';
import { AppSidebar } from './sidebar';

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <AppHeader aMenuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
      <AppSidebar aMenuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
    </>
  );
}
