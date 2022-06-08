import type { DLang, DTheme } from '@react-devui/ui/utils/global';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DRoot } from '@react-devui/ui';
import { useAsync, useMount } from '@react-devui/ui/hooks';

import { environment } from '../environments/environment';
import { AppLayout } from './components';
import { AppRoutes } from './routes/Routes';

export interface AppContextData {
  gTheme: DTheme;
  gOnThemeChange: (theme: DTheme) => void;
}
export const AppContext = React.createContext<AppContextData | null>(null);

export function App() {
  const { i18n } = useTranslation();
  const asyncCapture = useAsync();

  const mainRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<DTheme>(() => (localStorage.getItem('theme') as DTheme) ?? 'light');

  useMount(() => {
    if (!environment.production) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      if (!window.location.hash && mainRef.current) {
        asyncGroup.setTimeout(() => {
          if (mainRef.current) {
            mainRef.current.scrollTop = Number(localStorage.getItem('scrollTop') ?? 0);
          }
        }, 300);
      }

      asyncGroup.fromEvent(window, 'beforeunload').subscribe({
        next: () => {
          if (mainRef.current) {
            localStorage.setItem('scrollTop', mainRef.current.scrollTop.toString());
          }
        },
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('language', i18n.language);
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const rootContext = useMemo(
    () => ({
      theme,
      i18n: { lang: i18n.language as DLang },
    }),
    [i18n.language, theme]
  );

  const contextValue = useMemo<AppContextData>(
    () => ({
      gTheme: theme,
      gOnThemeChange: (theme) => {
        setTheme(theme);
        localStorage.setItem('theme', theme);
      },
    }),
    [theme]
  );

  return (
    <DRoot dContext={rootContext}>
      <AppContext.Provider value={contextValue}>
        <AppLayout />
      </AppContext.Provider>

      <main ref={mainRef} className="app-main">
        <AppRoutes />
      </main>
    </DRoot>
  );
}

export default App;
