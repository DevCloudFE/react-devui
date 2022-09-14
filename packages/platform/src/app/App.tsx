import type { UserState } from '../config/state';
import type { DConfigContextData } from '@react-devui/ui/hooks/d-config';
import type { DLang } from '@react-devui/ui/hooks/i18n';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAsync, useLocalStorage, useMount } from '@react-devui/hooks';
import { DRoot } from '@react-devui/ui';

import { LOGIN_PATH } from '../config/other';
import { STORAGE_KEY } from '../config/storage';
import { AppRoutes } from './Routes';
import { useHttp, useInit } from './hooks';

export function App() {
  const { i18n } = useTranslation();
  const createHttp = useHttp();
  const init = useInit();
  const navigate = useNavigate();
  const async = useAsync();
  const [language] = useLocalStorage<DLang>(...STORAGE_KEY.language);
  const [loading, setLoading] = useState(true);

  useMount(() => {
    i18n.changeLanguage(language);

    const [http] = createHttp();
    http<UserState>({
      url: '/api/auth/me',
      method: 'get',
    }).subscribe({
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
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (loading === false) {
      const loader = document.querySelector('.fp-loader') as HTMLElement;
      loader.style.cssText = 'opacity:0;transition:opacity 0.5s ease-out;';
      async.setTimeout(() => {
        document.body.removeChild(loader);
      }, 500);
    }
  }, [async, loading]);

  const rootContext = useMemo<DConfigContextData>(
    () => ({
      i18n: { lang: language },
      layout: { scrollEl: 'main.app-main', resizeEl: 'article.app-md-route' },
    }),
    [language]
  );

  return <DRoot dContext={rootContext}>{loading ? null : <AppRoutes />}</DRoot>;
}

export default App;
