import type { DDropdownItem } from '@react-devui/ui/components/dropdown';
import type { DLang } from '@react-devui/ui/hooks/i18n';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalStorage } from '@react-devui/hooks';
import { DCustomIcon } from '@react-devui/icons';
import { DDropdown } from '@react-devui/ui';

import { STORAGE_KEY } from '../../../config/storage';

export function AppLanguage(props: React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element | null {
  const [, setLanguage] = useLocalStorage<DLang>(...STORAGE_KEY.language);
  const { t, i18n } = useTranslation();

  return (
    <DDropdown
      dList={(
        [
          ['🇨🇳', '简体中文', 'zh-CN'],
          ['🇺🇸', 'English', 'en-US'],
        ] as [string, string, DLang][]
      ).map<DDropdownItem<DLang>>((item) => ({
        id: item[2],
        label: (
          <>
            <div className="app-language__item-region">{item[0]}</div>
            <span className="app-language__item-lng">{item[1]}</span>
          </>
        ),
        type: 'item',
      }))}
      onItemClick={(id) => {
        setLanguage(id);
        i18n.changeLanguage(id);
      }}
    >
      <button {...props} aria-label={t('components.language.Change language')}>
        <DCustomIcon viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none"></path>
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z "></path>
        </DCustomIcon>
      </button>
    </DDropdown>
  );
}
