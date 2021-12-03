import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DI18NContext, DConfigContext, DIconContext } from '@react-devui/ui';
import { useAsync, useImmer } from '@react-devui/ui/hooks';

import { environment } from '../environments/environment';
import { AppHeader, AppSidebar } from './components';
import icons from './icons.json';
import { AppRoutes } from './routes/Routes';

export type AppContextData = { onMount: () => void } | null;
export const AppContext = React.createContext<AppContextData>(null);

export function App() {
  const { i18n } = useTranslation();
  const asyncCapture = useAsync();

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

  const contextValue = useMemo(
    () => ({
      onMount: () => {
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
    }),
    [mainEl]
  );

  return (
    <AppContext.Provider value={contextValue}>
      <DI18NContext.Provider value={{ lang: i18n.language as 'en-US' | 'zh-Hant' }}>
        <DConfigContext.Provider value={{ content: 'main .app-route-article' }}>
          <DIconContext.Provider value={icons}>
            <AppHeader />
            <AppSidebar />
            <main ref={mainRef} className="app-main">
              <AppRoutes></AppRoutes>
            </main>
          </DIconContext.Provider>
        </DConfigContext.Provider>
      </DI18NContext.Provider>
    </AppContext.Provider>
  );
}

export default App;
