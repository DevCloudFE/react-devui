import { useCallback, useContext } from 'react';

import { DConfigContext } from '../d-config';
import dResources from './resources.json';

export function useTranslation(group?: string): [(...keys: string[]) => string, 'en-US' | 'zh-Hant'] {
  const { lang = 'en-US', resources = dResources } = useContext(DConfigContext).i18n ?? {};
  const t = useCallback(
    (...keys: string[]) => {
      let content = group ? resources[group] : resources;
      for (const key of keys) {
        content = content?.[key];
      }
      return content?.[lang] ?? keys.join('.');
    },
    [lang, resources, group]
  );

  return [t, lang];
}
