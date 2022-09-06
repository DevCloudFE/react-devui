import { useContext } from 'react';

import { DConfigContext } from '../d-config/contex';
import resources from './resources.json';

export type DLang = 'en-US' | 'zh-Hant';

export function useTranslation(): [(...keys: string[]) => string, DLang] {
  const { lang = 'en-US', resources: customResources } = useContext(DConfigContext)?.i18n ?? {};

  return [
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
    lang,
  ];
}
