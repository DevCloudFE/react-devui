import type { DLang } from '../../../utils/types';

import { get } from 'lodash';

import { useContextRequired } from '../../../hooks';
import { DConfigContext } from '../contex';

export function useTranslation(): [(...keys: string[]) => string, DLang] {
  const { lang, resources } = useContextRequired(DConfigContext).i18n;

  return [
    (...keys: string[]) => {
      if (keys.length === 1) {
        keys = ['Common', keys[0]];
      }
      keys.unshift(lang);

      return get(resources, keys, keys.join('.'));
    },
    lang,
  ];
}
