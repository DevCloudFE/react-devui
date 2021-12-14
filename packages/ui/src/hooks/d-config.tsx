import { isUndefined } from 'lodash';
import React, { useContext, useEffect } from 'react';

import { getFragmentChildren } from '../utils';
import { useRefSelector } from './element-ref';

interface Resources {
  [index: string]: string | Resources;
}

export interface DConfigContextData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: { [index: string]: any };
  prefix?: string;
  i18n?: {
    lang?: 'en-US' | 'zh-Hant';
    resources?: Resources;
  };
  icons?: Array<{
    name: string;
    list: Array<{
      viewBox: string;
      paths: string[];
      type?: string;
    }>;
  }>;
  content?: string;
}
export const DConfigContext = React.createContext<DConfigContextData>({});

export function DConfigRoot(props: DConfigContextData & { children: React.ReactNode }) {
  const { children, ...restProps } = props;

  const lang = restProps.i18n?.lang ?? 'en-US';

  useEffect(() => {
    if (lang === 'en-US') {
      document.body.classList.add('CJK');
    } else {
      document.body.classList.remove('CJK');
    }
  }, [lang]);

  return <DConfigContext.Provider value={restProps}>{children}</DConfigContext.Provider>;
}

export function usePrefixConfig() {
  const prefix = useContext(DConfigContext).prefix ?? 'd-';
  return prefix;
}

export function useRootContentConfig() {
  const content = useContext(DConfigContext).content ?? null;
  const contentRef = useRefSelector(content);

  return contentRef;
}

export function useComponentConfig<T>(component: string, props: T): T {
  const components = useContext(DConfigContext).components ?? {};
  const customConfig = components[component] ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noUndefinedProps: any = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      (noUndefinedProps as T)[key] = props[key];
    }
  });

  let children: React.ReactNode = undefined;
  if ('children' in customConfig) {
    children = getFragmentChildren(customConfig.children);
  }
  if ('children' in noUndefinedProps) {
    children = getFragmentChildren(noUndefinedProps.children);
  }
  return { ...customConfig, ...(noUndefinedProps as T), children };
}
