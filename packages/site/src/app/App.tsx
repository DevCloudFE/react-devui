/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import type { DRootProps } from '@react-devui/ui';
import type { DLang } from '@react-devui/ui/utils/types';

import routes from 'packages/site/dist/routes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useEvent, useMount, useStorage } from '@react-devui/hooks';
import { DRoot } from '@react-devui/ui';

import { environment } from '../environments/environment';
import { AppFCPLoader } from './components';
import AppHomeRoute from './routes/home/Home';
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
  const languageStorage = useStorage<DLang>('language', 'en-US');
  const themeStorage = useStorage<AppTheme>('theme', 'light');
  const scrollTopStorage = useStorage('scrollTop', 0, 'number');

  useEvent({ current: window }, 'beforeunload' as any, () => {
    if (!environment.production) {
      if (mainEl) {
        scrollTopStorage.set(mainEl.scrollTop);
      }
    }
  });

  useMount(() => {
    i18n.changeLanguage(languageStorage.value);
  });

  useEffect(() => {
    document.documentElement.lang = languageStorage.value;
  }, [languageStorage.value]);

  useEffect(() => {
    for (const t of ['light', 'dark']) {
      document.body.classList.toggle(t, themeStorage.value === t);
    }
    const colorScheme = document.documentElement.style.colorScheme;
    document.documentElement.style.colorScheme = themeStorage.value;
    return () => {
      document.documentElement.style.colorScheme = colorScheme;
    };
  }, [themeStorage.value]);

  useEffect(() => {
    if (!environment.production && mainEl) {
      mainEl.scrollTop = scrollTopStorage.value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainEl]);

  const rootContext = useMemo<DRootProps['context']>(
    () => ({
      i18n: { lang: languageStorage.value },
      layout: { pageScrollEl: '#app-main', contentResizeEl: '#app-content' },
    }),
    [languageStorage.value]
  );

  return (
    <DRoot context={rootContext}>
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
                <main ref={mainRef} id="app-main" className="app-main">
                  <section id="app-content">{React.createElement(component)}</section>
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
