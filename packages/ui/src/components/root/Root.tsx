import type { DConfigContextData } from '../../hooks/d-config';
import type { DElementSelector } from '../../hooks/element';

import { isUndefined } from 'lodash';
import { useEffect } from 'react';
import { useState } from 'react';
import { Subject } from 'rxjs';
import { SVResizeObserver } from 'scrollview-resize';

import { useElement, useIsomorphicLayoutEffect } from '../../hooks';
import { DConfigContext } from '../../hooks/d-config';
import { Notification } from './Notification';
import { Toast } from './Toast';

export interface DRootProps extends Omit<DConfigContextData, 'onScrollViewChange$'> {
  contentSelector?: DElementSelector;
  children: React.ReactNode;
}

export function DRoot(props: DRootProps) {
  const { contentSelector, children, theme, i18n, ...restProps } = props;

  const lang = i18n?.lang ?? 'en-US';

  const [onScrollViewChange$] = useState(() => new Subject<void>());
  const contentEl = useElement(contentSelector ?? null);

  useIsomorphicLayoutEffect(() => {
    document.body.classList.toggle('CJK', lang === 'zh-Hant');
  }, [lang]);

  useIsomorphicLayoutEffect(() => {
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
    if (isUndefined(contentSelector)) {
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
  }, [contentEl, contentSelector, onScrollViewChange$]);

  return (
    <DConfigContext.Provider
      value={{
        theme,
        i18n,
        onScrollViewChange$,
        ...restProps,
      }}
    >
      {children}
      <Notification></Notification>
      <Toast></Toast>
    </DConfigContext.Provider>
  );
}
