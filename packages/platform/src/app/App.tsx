import type { UserState } from '../core/state';
import type { DRootProps } from '@react-devui/ui';
import type { DLang } from '@react-devui/ui/utils/types';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAsync, useMount, useStorage } from '@react-devui/hooks';
import { DRoot } from '@react-devui/ui';

import { LOGIN_PATH } from '../config/other';
import { STORAGE_KEY } from '../config/storage';
import { useHttp, useInit } from '../core';
import { AppRoutes } from './Routes';

export type AppTheme = 'light' | 'dark';

export function App() {
  const { i18n } = useTranslation();
  const http = useHttp();
  const init = useInit();
  const navigate = useNavigate();
  const async = useAsync();
  const [loading, setLoading] = useState(true);
  const languageStorage = useStorage<DLang>(...STORAGE_KEY.language);
  const themeStorage = useStorage<AppTheme>(...STORAGE_KEY.theme);

  useMount(() => {
    i18n.changeLanguage(languageStorage.value);

    const [authReq] = http<UserState>({
      url: '/auth/me',
      method: 'get',
    });
    authReq.subscribe({
      next: (res) => {
        setLoading(false);
        init(res);
      },
      error: () => {
        setLoading(false);
        navigate(LOGIN_PATH);
      },
    });
  });

  useEffect(() => {
    document.documentElement.lang = languageStorage.value;
  }, [languageStorage.value]);

  useEffect(() => {
    if (loading === false) {
      const loader = document.querySelector('.fp-loader') as HTMLElement;
      loader.style.cssText = 'opacity:0;transition:opacity 0.5s ease-out;';
      async.setTimeout(() => {
        document.body.removeChild(loader);
      }, 500);
    }
  }, [async, loading]);

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

  const rootContext = useMemo<DRootProps['context']>(
    () => ({
      i18n: { lang: languageStorage.value },
      layout: { pageScrollEl: '#app-main', contentResizeEl: '#app-content' },
    }),
    [languageStorage.value]
  );

  return <DRoot context={rootContext}>{loading ? null : <AppRoutes />}</DRoot>;
}

export default App;
