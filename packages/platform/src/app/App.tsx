import type { AppUser } from './core/store';
import type { DRootProps } from '@react-devui/ui';
import type { DLang } from '@react-devui/ui/utils/types';

import { isNull } from 'lodash';
import { useStore } from 'rcl-store';
import React, { useEffect, useMemo, useState } from 'react';

import { useAsync, useMount, useStorage } from '@react-devui/hooks';
import { DNotification, DToast } from '@react-devui/ui';
import { DRoot } from '@react-devui/ui';

import { AppRoutes } from './Routes';
import { STORAGE_KEY } from './config/storage';
import { GlobalStore, TOKEN, useHttp, useInit } from './core';

export type AppTheme = 'light' | 'dark';

export function App() {
  const http = useHttp();
  const init = useInit();
  const async = useAsync();
  const [loading, setLoading] = useState(!isNull(TOKEN.value));
  const languageStorage = useStorage<DLang>(...STORAGE_KEY.language);
  const themeStorage = useStorage<AppTheme>(...STORAGE_KEY.theme);
  const [{ dialogs, notifications, toasts }] = useStore(GlobalStore, ['dialogs', 'notifications', 'toasts']);

  useMount(() => {
    if (!isNull(TOKEN.value)) {
      http<string>({
        url: '/auth/refresh',
        method: 'post',
      }).subscribe({
        next: (res) => {
          TOKEN.set(res);

          http<AppUser>({
            url: '/auth/me',
            method: 'get',
          }).subscribe({
            next: (res) => {
              setLoading(false);
              init(res);
            },
            error: () => {
              setLoading(false);
            },
          });
        },
        error: () => {
          setLoading(false);
        },
      });
    }
  });

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

  const rootContext = useMemo<DRootProps['context']>(
    () => ({
      i18n: { lang: languageStorage.value },
      layout: { pageScrollEl: '#app-main', contentResizeEl: '#app-content' },
    }),
    [languageStorage.value]
  );

  return (
    <DRoot context={rootContext}>
      {loading ? null : <AppRoutes />}
      {dialogs.map(({ key, type, props }) => React.createElement(type, { key, ...props }))}
      {notifications.map(({ key, ...props }) => (
        <DNotification {...props} key={key}></DNotification>
      ))}
      {toasts.map(({ key, ...props }) => (
        <DToast {...props} key={key}></DToast>
      ))}
    </DRoot>
  );
}

export default App;
