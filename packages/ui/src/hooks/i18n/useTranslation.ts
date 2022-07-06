import { useCallback, useContext } from 'react';

import { DConfigContext } from '../d-config/contex';
import resources from './resources.json';

export function useTranslation(): [(...keys: string[]) => string, 'en-US' | 'zh-Hant'] {
  const { lang = 'zh-Hant', resources: customResources } = useContext(DConfigContext)?.i18n ?? {};
  const t = useCallback(
    (...keys: string[]) => {
      if (keys.length === 1) {
        keys = ['Common', keys[0]];
      }

      let content;
      if (customResources) {
        content = customResources;
        for (const key of keys) {
          content = content?.[key];
        }
      }
      if (!content) {
        content = resources;
        for (const key of keys) {
          content = content?.[key];
        }
      }

      return content?.[lang] ?? keys.join('.');
    },
    [customResources, lang]
  );

  return [t, lang];
}
