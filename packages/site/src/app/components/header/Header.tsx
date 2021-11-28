import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import './Header.scss';

export function AppHeader() {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(() => {
    if (i18n.language === 'en-US') {
      document.body.classList.add('CJK');
      i18n.changeLanguage('zh-Hant');
    } else {
      document.body.classList.remove('CJK');
      i18n.changeLanguage('en-US');
    }
  }, [i18n]);

  return (
    <header className="app-header is-shadow">
      <img className="app-header__logo" src="/assets/logo.svg" alt="Logo" width="36" height="36" />
      <span className="app-header__title">DevUI</span>
      <span onClick={changeLanguage}>{i18n.language}</span>
    </header>
  );
}
