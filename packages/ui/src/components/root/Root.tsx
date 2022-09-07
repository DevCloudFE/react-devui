/* eslint-disable @typescript-eslint/no-var-requires */
import type { DConfigContextData } from '../../hooks/d-config/contex';
import type { DIconContextData } from '@react-devui/icons/Icon';

import { useMemo } from 'react';

import { DIconContext } from '@react-devui/icons/Icon';

import { dayjs } from '../../dayjs';
import { DConfigContext } from '../../hooks/d-config/contex';
import { Notification } from './Notification';
import { Toast } from './Toast';

export interface DRootProps {
  children: React.ReactNode;
  dContext?: DConfigContextData;
}

export function DRoot(props: DRootProps): JSX.Element | null {
  const { children, dContext } = props;

  const lang = dContext?.i18n?.lang ?? 'zh-CN';

  switch (lang) {
    case 'en-US':
      dayjs.locale('en');
      break;

    case 'zh-CN':
      dayjs.locale('zh-cn');
      break;

    default:
      break;
  }

  const iconProps = dContext?.componentConfigs?.DIcon;
  const namespace = dContext?.namespace ?? 'd';
  const iconContext = useMemo<DIconContextData>(() => {
    const prefix = `${namespace}-`;
    return {
      props: iconProps,
      namespace,
      twoToneColor: (theme) => [
        theme ? `var(--${prefix}color-${theme})` : `var(--${prefix}text-color)`,
        theme ? `var(--${prefix}background-color-${theme})` : `rgb(var(--${prefix}text-color-rgb) / 10%)`,
      ],
    };
  }, [iconProps, namespace]);

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
