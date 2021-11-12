import { useTranslation } from 'react-i18next';

import './Header.scss';

export function AppHeader() {
  const { i18n } = useTranslation();

  return (
    <header className="app-header is-shadow">
      <img className="app-header__logo" src="/assets/logo.svg" alt="Logo" width="36" height="36" />
      <span className="app-header__title">DevUI</span>
      <span onClick={() => i18n.changeLanguage(i18n.language === 'en-US' ? 'zh-Hant' : 'en-US')}>{i18n.language}</span>
    </header>
  );
}
