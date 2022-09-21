import type { DConfigContextData } from '@react-devui/ui/hooks/d-config';
import type { DLang } from '@react-devui/ui/hooks/i18n';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import routes from 'packages/site/dist/routes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useEvent, useLocalStorage, useMount } from '@react-devui/hooks';
import { DRoot } from '@react-devui/ui';

import { environment } from '../environments/environment';
import { AppFCPLoader } from './components';
import AppHomeRoute from './routes/Home';
import AppLayout from './routes/layout/Layout';

export type AppTheme = 'light' | 'dark';

export function App() {
  const [mainEl, setMainEl] = useState<HTMLElement>();
  const mainRef = useCallback((el: HTMLElement | null) => {
    if (el) {
      setMainEl(el);
    }
  }, []);

  const { i18n } = useTranslation();
  const [language] = useLocalStorage<DLang>('language', 'en-US');
  const [theme] = useLocalStorage<AppTheme>('theme', 'light');
  const [scrollTop, setScrollTop] = useLocalStorage('scrollTop', 0, 'number');

  useEvent(window, 'beforeunload' as any, () => {
    if (!environment.production) {
      if (mainEl) {
        setScrollTop(mainEl.scrollTop);
      }
    }
  });

  useMount(() => {
    i18n.changeLanguage(language);
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    for (const t of ['light', 'dark']) {
      document.body.classList.toggle(t, theme === t);
    }
    const colorScheme = document.documentElement.style.colorScheme;
    document.documentElement.style.colorScheme = theme;
    return () => {
      document.documentElement.style.colorScheme = colorScheme;
    };
  }, [theme]);

  useEffect(() => {
    if (!environment.production && mainEl) {
      mainEl.scrollTop = scrollTop;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainEl]);

  const rootContext = useMemo<DConfigContextData>(
    () => ({
      i18n: { lang: language },
      layout: { scrollEl: '.app-main', resizeEl: '.app-md-route' },
    }),
    [language]
  );

  return (
    <DRoot dContext={rootContext}>
      <AppLayout />
      <Routes>
        <Route path="/" element={<AppHomeRoute />} />
        <Route path="/docs" element={<Navigate to="/docs/Overview" replace />} />
        <Route path="/components" element={<Navigate to="/components/Button" replace />} />
        {routes.map(({ path, component }) => (
          <Route
            key={path}
            path={path}
            element={
              <React.Suspense fallback={<AppFCPLoader />}>
                <main ref={mainRef} className="app-main">
                  {React.createElement(component)}
                </main>
              </React.Suspense>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DRoot>
  );
}

export default App;
