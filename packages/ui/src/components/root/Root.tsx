/* eslint-disable @typescript-eslint/no-var-requires */
import type { DConfigContextData } from '../../hooks/d-config/contex';
import type { DLang } from '../../hooks/i18n';
import type { DIconContextData } from '@react-devui/icons/Icon';

import { useMemo } from 'react';

import { DIconContext } from '@react-devui/icons/Icon';

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

  const iconProps = dContext?.componentConfigs?.DIcon;
  const prefix = dContext?.prefix ?? 'd-';
  const iconContext = useMemo<DIconContextData>(
    () => ({
      props: iconProps,
      prefix,
      twoToneColor: (theme) => [
        theme ? `var(--${prefix}color-${theme})` : `var(--${prefix}text-color)`,
        theme ? `var(--${prefix}background-color-${theme})` : `rgb(var(--${prefix}text-color-rgb) / 10%)`,
      ],
    }),
    [iconProps, prefix]
  );

  return (
    <DConfigContext.Provider value={dContext}>
      <DIconContext.Provider value={iconContext}>
        {children}
        <Notification></Notification>
        <Toast></Toast>
      </DIconContext.Provider>
    </DConfigContext.Provider>
  );
}
