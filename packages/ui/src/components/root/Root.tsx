import type { DPartialConfigContextData } from './contex';
import type { DIconContextData } from '@react-devui/icons/Icon';

import { useContext, useMemo } from 'react';

import { DIconContext } from '@react-devui/icons/Icon';
import { getClassName } from '@react-devui/utils';

import { dayjs } from '../../dayjs';
import { Notification } from './Notification';
import { Toast } from './Toast';
import { DConfigContextManager } from './contex';
import { DConfigContext } from './contex';
import resources from './resources.json';

const ROOT = new DConfigContextManager({
  namespace: 'rd',
  componentConfigs: {},
  i18n: {
    lang: 'en-US',
    resources,
  },
  layout: {
    pageScrollEl: ':root',
  },
  globalScroll: false,
});

export interface DRootProps {
  children: React.ReactNode;
  context?: DPartialConfigContextData;
}

export function DRoot(props: DRootProps): JSX.Element | null {
  const { children, context: _context } = props;

  const parent = useContext(DConfigContext);

  const [context, iconContext] = useMemo<[DConfigContextManager, DIconContextData]>(() => {
    const context = new DConfigContextManager((parent ?? ROOT).mergeContext(_context ?? {}));
    if (parent) {
      context.setParent(parent);
    }

    const namespace = context.namespace;
    const iconProps = context.componentConfigs.DIcon;

    return [
      context,
      {
        props: iconProps,
        className: (theme) => getClassName(`${namespace}-icon`, { [`t-${theme}`]: theme }),
        twoToneColor: (theme) => [
          theme ? `var(--${namespace}-color-${theme})` : `var(--${namespace}-text-color)`,
          theme ? `var(--${namespace}-background-color-${theme})` : `rgb(var(--${namespace}-text-color-rgb) / 10%)`,
        ],
      },
    ];
  }, [_context, parent]);

  switch (context.i18n.lang) {
    case 'en-US':
      dayjs.locale('en');
      break;

    case 'zh-CN':
      dayjs.locale('zh-cn');
      break;

    default:
      break;
  }

  return (
    <DConfigContext.Provider value={context}>
      {parent ? (
        children
      ) : (
        <DIconContext.Provider value={iconContext}>
          {children}
          <Notification></Notification>
          <Toast></Toast>
        </DIconContext.Provider>
      )}
    </DConfigContext.Provider>
  );
}
