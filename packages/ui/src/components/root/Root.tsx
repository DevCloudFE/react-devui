import type { DConfigContextData } from '../../hooks/d-config';

import { useEffect, useMemo } from 'react';

import { DConfigContext } from '../../hooks/d-config';
import { Notification } from './Notification';
import { Toast } from './Toast';

export interface DRootProps extends DConfigContextData {
  children: React.ReactNode;
}

export function DRoot(props: DRootProps) {
  const { prefix, theme, componentConfigs, i18n, icons, contentSelector, children } = props;

  const lang = i18n?.lang ?? 'en-US';

  useEffect(() => {
    document.body.classList.toggle('CJK', lang === 'zh-Hant');
  }, [lang]);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
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
