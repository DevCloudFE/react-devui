/* eslint-disable @typescript-eslint/no-var-requires */
import type { DConfigContextData } from '../../hooks/d-config/contex';
import type { DLang } from '../../utils/global';

import { useEffect } from 'react';

import { DConfigContext } from '../../hooks/d-config/contex';
import { dayjs } from '../dayjs';
import { Notification } from './Notification';
import { Toast } from './Toast';

export interface DRootProps {
  children: React.ReactNode;
  dContext?: DConfigContextData;
}

const loadLocales: DLang[] = [];

export function DRoot(props: DRootProps): JSX.Element | null {
  const { children, dContext } = props;

  const lang = dContext?.i18n?.lang ?? 'zh-Hant';

  if (!loadLocales.includes(lang)) {
    loadLocales.push(lang);

    switch (lang) {
      case 'en-US':
        dayjs.locale('en-US', require('dayjs/locale/en'));
        break;

      case 'zh-Hant':
        dayjs.locale('zh-Hant', require('dayjs/locale/zh'));
        break;

      default:
        break;
    }
  }

  useEffect(() => {
    document.body.classList.toggle('CJK', lang === 'zh-Hant');
  }, [lang]);

  return (
    <DConfigContext.Provider value={dContext}>
      {children}
      <Notification></Notification>
      <Toast></Toast>
    </DConfigContext.Provider>
  );
}
