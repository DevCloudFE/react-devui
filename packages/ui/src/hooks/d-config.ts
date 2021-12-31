import { isUndefined } from 'lodash';
import React, { useContext } from 'react';

import { getFragmentChildren } from '../utils';
import { useRefSelector } from './element-ref';

interface Resources {
  [index: string]: string | Resources;
}

export interface DConfigContextData {
  prefix?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentConfigs?: { [index: string]: any };
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
  contentSelector?: string;
}
export const DConfigContext = React.createContext<DConfigContextData>({});

export function usePrefixConfig() {
  const prefix = useContext(DConfigContext).prefix ?? 'd-';
  return prefix;
}

export function useComponentConfig<T>(component: string, props: T): T {
  const componentConfigs = useContext(DConfigContext).componentConfigs ?? {};
  const customConfig = componentConfigs[component] ?? {};
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

export function useContentRefConfig() {
  const contentSelector = useContext(DConfigContext).contentSelector ?? null;
  const contentRef = useRefSelector(contentSelector);

  return contentRef;
}
