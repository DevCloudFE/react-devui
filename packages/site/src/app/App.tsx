import type { DLang, DTheme } from '@react-devui/ui/hooks/d-config';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { DRoot, NotificationService, ToastService } from '@react-devui/ui';
import { useAsync } from '@react-devui/ui/hooks';

import { environment } from '../environments/environment';
import { AppHeader, AppSidebar } from './components';
import icons from './configs/icons.json';
import { AppRoutes } from './routes/Routes';

export interface AppContextData {
  menuOpen: boolean;
  pageMounted: boolean;
  theme: DTheme;
  changeTheme: (theme: DTheme) => void;
  onMount: () => void;
  onMenuOpenChange: (open: boolean) => void;
}
export const AppContext = React.createContext<AppContextData | null>(null);

export function App() {
  const { i18n } = useTranslation();
  const asyncCapture = useAsync();

  const [menuOpen, setMenuOpen] = useState(false);
  const [pageMounted, setPageMounted] = useState(false);
  const [theme, setTheme] = useState<DTheme>(() => (localStorage.getItem('theme') as DTheme) ?? 'light');

  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const mainRef = useCallback(
    (node) => {
      if (node !== null) {
        setMainEl(node);
      }
    },
    [setMainEl]
  );

  useLayoutEffect(() => {
    localStorage.setItem('language', i18n.language);
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useLayoutEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('style', 'position: absolute;top: -999px;left: -999px;overflow: scroll;width: 100px;height: 100px;');
    document.body.appendChild(el);
    document.body.classList.toggle('scrollbar-dark', theme === 'dark' && el.clientHeight < 100);
    document.body.removeChild(el);
  }, [theme]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (mainEl) {
      if (!environment.production) {
        asyncGroup.fromEvent(window, 'beforeunload').subscribe({
          next: () => {
            localStorage.setItem('scrollTop', mainEl.scrollTop.toString());
          },
        });
      }
      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, mainEl]);

  const location = useLocation();
  useEffect(() => {
    NotificationService.closeAll(false);
    ToastService.closeAll(false);
  }, [location]);

  const contextValue = useMemo<AppContextData>(
    () => ({
      menuOpen,
      pageMounted,
      theme,
      changeTheme: (theme) => {
        setTheme(theme);
        localStorage.setItem('theme', theme);
      },
      onMount: () => {
        setPageMounted(true);
        if (mainEl) {
          if (window.location.hash) {
            const hash = window.location.hash;
            window.location.hash = '';
            window.location.hash = hash;
          } else if (!environment.production) {
            mainEl.scrollTop = Number(localStorage.getItem('scrollTop') ?? 0);
          }
        }
      },
      onMenuOpenChange: (open) => {
        setMenuOpen(open);
      },
    }),
    [mainEl, menuOpen, pageMounted, theme]
  );

  return (
    <DRoot theme={theme} i18n={{ lang: i18n.language as DLang }} icons={icons} contentSelector="main .app-route-article">
      <AppContext.Provider value={contextValue}>
        <AppHeader />
        <AppSidebar />
        <main ref={mainRef} className="app-main">
          <AppRoutes />
        </main>
      </AppContext.Provider>
    </DRoot>
  );
}

export default App;
