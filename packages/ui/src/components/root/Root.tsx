import type { DConfigContextData } from '../../hooks/d-config/contex';

import { useEffect } from 'react';

import { DConfigContext } from '../../hooks/d-config/contex';
import { Notification } from './Notification';
import { Toast } from './Toast';

export interface DRootProps {
  children: React.ReactNode;
  dContext?: DConfigContextData;
}

export function DRoot(props: DRootProps): JSX.Element | null {
  const { children, dContext } = props;

  const lang = dContext?.i18n?.lang ?? 'zh-Hant';
  const theme = dContext?.theme;

  useEffect(() => {
    document.body.classList.toggle('CJK', lang === 'zh-Hant');
  }, [lang]);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    if (theme === 'dark') {
      const colorScheme = document.documentElement.style.colorScheme;
      document.documentElement.style.colorScheme = 'dark';
      return () => {
        document.documentElement.style.colorScheme = colorScheme;
      };
    }
  }, [theme]);

  return (
    <DConfigContext.Provider value={dContext}>
      {children}
      <Notification></Notification>
      <Toast></Toast>
    </DConfigContext.Provider>
  );
}
