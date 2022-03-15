import type { DConfigContextData } from '../../hooks/d-config/contex';
import type { DElementSelector } from '../../hooks/ui/useElement';

import { isUndefined } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useState } from 'react';
import { Subject } from 'rxjs';
import { SVResizeObserver } from 'scrollview-resize';

import { useElement } from '../../hooks';
import { DConfigContext } from '../../hooks/d-config/contex';
import { Notification } from './Notification';
import { Toast } from './Toast';

export interface DRootProps {
  children: React.ReactNode;
  dContext?: Omit<DConfigContextData, 'onScrollViewChange$'>;
  dContentSelector?: DElementSelector;
}

export function DRoot(props: DRootProps): JSX.Element | null {
  const { children, dContext, dContentSelector } = props;

  const lang = dContext?.i18n?.lang ?? 'zh-Hant';
  const theme = dContext?.theme;

  const [onScrollViewChange$] = useState(() => new Subject<void>());
  const contentEl = useElement(dContentSelector ?? null);

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

  useEffect(() => {
    if (isUndefined(dContentSelector)) {
      const observer = new ResizeObserver(() => {
        onScrollViewChange$.next();
      });
      observer.observe(document.documentElement);
      return () => {
        observer.disconnect();
      };
    } else if (contentEl) {
      const observer = new SVResizeObserver(() => {
        onScrollViewChange$.next();
      });
      observer.observe(contentEl);
      return () => {
        observer.disconnect();
      };
    }
  }, [contentEl, dContentSelector, onScrollViewChange$]);

  const contextValue = useMemo<DConfigContextData>(
    () => ({
      ...dContext,
      onScrollViewChange$,
    }),
    [dContext, onScrollViewChange$]
  );

  return (
    <DConfigContext.Provider value={contextValue}>
      {children}
      <Notification></Notification>
      <Toast></Toast>
    </DConfigContext.Provider>
  );
}
