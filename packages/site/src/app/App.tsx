import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DConfigRoot } from '@react-devui/ui';
import { useAsync, useImmer } from '@react-devui/ui/hooks';

import { environment } from '../environments/environment';
import { AppHeader, AppSidebar } from './components';
import icons from './configs/icons.json';
import { AppRoutes } from './routes/Routes';

export interface AppContextData {
  menuOpen: boolean;
  pageMounted: boolean;
  onMount: () => void;
  onMenuOpenChange: (open: boolean) => void;
}
export const AppContext = React.createContext<AppContextData | null>(null);

export function App() {
  const { i18n } = useTranslation();
  const asyncCapture = useAsync();

  const [menuOpen, setMenuOpen] = useImmer(false);
  const [pageMounted, setPageMounted] = useImmer(false);

  const [mainEl, setMainEl] = useImmer<HTMLElement | null>(null);
  const mainRef = useCallback(
    (node) => {
      if (node !== null) {
        setMainEl(node);
      }
    },
    [setMainEl]
  );

  useEffect(() => {
    localStorage.setItem('language', i18n.language);
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

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

  const contextValue = useMemo<AppContextData>(
    () => ({
      menuOpen,
      pageMounted,
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
    [mainEl, menuOpen, pageMounted, setMenuOpen, setPageMounted]
  );

  return (
    <AppContext.Provider value={contextValue}>
      <DConfigRoot content="main .app-route-article" i18n={{ lang: i18n.language as 'en-US' | 'zh-Hant' }} icons={icons}>
        <AppHeader />
        <AppSidebar />
        <main ref={mainRef} className="app-main">
          <AppRoutes />
        </main>
      </DConfigRoot>
    </AppContext.Provider>
  );
}

export default App;
