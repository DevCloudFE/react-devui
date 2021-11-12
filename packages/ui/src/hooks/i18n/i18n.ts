import React, { useCallback, useContext } from 'react';

import dResources from './resources.json';

interface Resources {
  [index: string]: string | Resources;
}

export const DI18NContext = React.createContext<{
  lang: 'en-US' | 'zh-Hant';
  resources?: Resources;
}>({ lang: 'en-US' });

export function useTranslation(group: string) {
  const { lang, resources } = useContext(DI18NContext);
  const t = useCallback(
    (...keys: string[]) => {
      let content = (resources ?? dResources)[group];
      for (const key of keys) {
        content = content?.[key];
      }
      return content?.[lang] ?? keys.join('.');
    },
    [lang, resources, group]
  );

  return [t, lang] as const;
}
