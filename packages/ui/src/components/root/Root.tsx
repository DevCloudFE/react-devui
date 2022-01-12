import type { DConfigContextData } from '../../hooks/d-config';

import { useLayoutEffect, useMemo } from 'react';

import { DConfigContext } from '../../hooks/d-config';
import { Notification } from './Notification';
import { Toast } from './Toast';

export interface DRootProps extends DConfigContextData {
  children: React.ReactNode;
}

export function DRoot(props: DRootProps) {
  const { prefix, theme, componentConfigs, i18n, icons, contentSelector, children } = props;

  const lang = i18n?.lang ?? 'en-US';

  useLayoutEffect(() => {
    document.body.classList.toggle('CJK', lang === 'zh-Hant');
  }, [lang]);

  useLayoutEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    if (theme === 'dark') {
      const colorScheme = document.documentElement.style.colorScheme;
      document.documentElement.style.colorScheme = 'dark';
      return () => {
        document.documentElement.style.colorScheme = colorScheme;
      };
    }
  }, [theme]);

  const context = useMemo<DConfigContextData>(
    () => ({
      prefix,
      theme,
      componentConfigs,
      i18n,
      icons,
      contentSelector,
    }),
    [componentConfigs, contentSelector, i18n, icons, prefix, theme]
  );

  return (
    <DConfigContext.Provider value={context}>
      {children}
      <Notification></Notification>
      <Toast></Toast>
    </DConfigContext.Provider>
  );
}
