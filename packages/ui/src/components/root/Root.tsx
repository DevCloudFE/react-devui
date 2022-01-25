import type { DConfigContextData } from '../../hooks/d-config';
import type { DElementSelector } from '../../hooks/element-ref';

import { isUndefined } from 'lodash';
import { useEffect } from 'react';
import { useState } from 'react';
import { Subject } from 'rxjs';
import { SVResizeObserver } from 'scrollview-resize';

import { useRefSelector } from '../../hooks';
import { DConfigContext } from '../../hooks/d-config';
import { Notification } from './Notification';
import { Toast } from './Toast';

export interface DRootProps extends Omit<DConfigContextData, 'scrollViewChange'> {
  contentSelector?: DElementSelector;
  children: React.ReactNode;
}

export function DRoot(props: DRootProps) {
  const { contentSelector, children, theme, i18n, ...restProps } = props;

  const lang = i18n?.lang ?? 'en-US';

  const [scrollViewChange] = useState(() => new Subject<void>());
  const contentRef = useRefSelector(contentSelector ?? null);

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
    if (isUndefined(contentSelector)) {
      const observer = new ResizeObserver(() => {
        scrollViewChange.next();
      });
      observer.observe(document.documentElement);
      return () => {
        observer.disconnect();
      };
    } else if (contentRef.current) {
      const observer = new SVResizeObserver(() => {
        scrollViewChange.next();
      });
      observer.observe(contentRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [contentRef, contentSelector, scrollViewChange]);

  return (
    <DConfigContext.Provider
      value={{
        theme,
        i18n,
        scrollViewChange,
        ...restProps,
      }}
    >
      {children}
      <Notification></Notification>
      <Toast></Toast>
    </DConfigContext.Provider>
  );
}
