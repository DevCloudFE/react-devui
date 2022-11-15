import type { AppTheme } from '../../App';
import type { DDropdownItem } from '@react-devui/ui/components/dropdown';
import type { DLang } from '@react-devui/ui/utils/types';

import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { useStorage } from '@react-devui/hooks';
import { DCustomIcon, GithubOutlined } from '@react-devui/icons';
import { DDropdown, DMenu, DSeparator } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

export interface AppHeaderProps {
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function AppHeader(props: AppHeaderProps): JSX.Element | null {
  const { menuOpen, onMenuOpenChange } = props;

  const { i18n, t } = useTranslation();
  const languageStorage = useStorage<DLang>('language', 'en-US');
  const themeStorage = useStorage<AppTheme>('theme', 'light');

  const location = useLocation();
  const activeId = location.pathname.startsWith('/docs') ? 'docs' : location.pathname.startsWith('/components') ? 'components' : null;

  return (
    <header className="app-layout-header">
      <Link className="d-none d-md-inline-flex app-layout-header__logo-container" to="/">
        <img src="/assets/logo.svg" alt="Logo" width="36" height="36" />
        <span className="app-layout-header__logo-title">DevUI</span>
      </Link>
      <button
        className="d-md-none app-layout-header__button app-layout-header__button--menu"
        aria-label={t(menuOpen ? 'Close main navigation' : 'Open main navigation')}
        onClick={() => onMenuOpenChange(true)}
      >
        <div
          className={getClassName('app-layout-header__hamburger', {
            'is-active': menuOpen,
          })}
        >
          <div></div>
          <div></div>
          <div></div>
        </div>
      </button>
      <DMenu
        className="d-none d-md-inline-block app-layout-header__menu"
        dList={[
          {
            id: 'docs',
            title: (
              <Link tabIndex={-1} to="/docs">
                {t('Docs')}
              </Link>
            ),
            type: 'item',
          },
          {
            id: 'components',
            title: (
              <Link tabIndex={-1} to="/components">
                {t('Components')}
              </Link>
            ),
            type: 'item',
          },
        ]}
        dMode="horizontal"
        dActive={activeId}
      ></DMenu>
      <DSeparator className="d-none d-md-inline-flex" style={{ margin: '16px 12px' }} dVertical />
      <div className="app-layout-header__button-container">
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
                <div className="app-layout-header__language-item-region">{item[0]}</div>
                <span className="app-layout-header__language-item-lng">{item[1]}</span>
              </>
            ),
            type: 'item',
          }))}
          onItemClick={(id) => {
            languageStorage.set(id);
            i18n.changeLanguage(id);
          }}
        >
          <button
            className="app-layout-header__button"
            aria-label={t('Change language')}
            onClick={() => {
              const val = languageStorage.value === 'en-US' ? 'zh-CN' : 'en-US';
              languageStorage.set(val);
              i18n.changeLanguage(val);
            }}
          >
            <DCustomIcon viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z "></path>
            </DCustomIcon>
          </button>
        </DDropdown>
        <button
          className="app-layout-header__button"
          aria-label={t(themeStorage.value === 'light' ? 'Dark theme' : 'Light theme')}
          onClick={() => {
            themeStorage.set(themeStorage.value === 'light' ? 'dark' : 'light');
          }}
        >
          <DCustomIcon viewBox="0 0 24 24" dSize={24}>
            {themeStorage.value === 'light' ? (
              <path d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM17 15C17.476 15 17.9408 14.9525 18.3901 14.862C17.296 17.3011 14.8464 19 12 19C8.13401 19 5 15.866 5 12C5 8.60996 7.40983 5.78277 10.6099 5.13803C10.218 6.01173 10 6.98041 10 8C10 11.866 13.134 15 17 15Z"></path>
            ) : (
              <>
                <path d="M10.5 1.5C10.5 0.671573 11.1716 0 12 0C12.8284 0 13.5 0.671573 13.5 1.5V2.5C13.5 3.32843 12.8284 4 12 4C11.1716 4 10.5 3.32843 10.5 2.5V1.5Z"></path>
                <path d="M10.5 21.5C10.5 20.6716 11.1716 20 12 20C12.8284 20 13.5 20.6716 13.5 21.5V22.5C13.5 23.3284 12.8284 24 12 24C11.1716 24 10.5 23.3284 10.5 22.5V21.5Z"></path>
                <path d="M24 12C24 11.1716 23.3284 10.5 22.5 10.5H21.5C20.6716 10.5 20 11.1716 20 12C20 12.8284 20.6716 13.5 21.5 13.5H22.5C23.3284 13.5 24 12.8284 24 12Z"></path>
                <path d="M2.5 10.5C3.32843 10.5 4 11.1716 4 12C4 12.8284 3.32843 13.5 2.5 13.5H1.5C0.671573 13.5 0 12.8284 0 12C0 11.1716 0.671573 10.5 1.5 10.5H2.5Z"></path>
                <path d="M20.4853 3.51472C19.8995 2.92893 18.9497 2.92893 18.364 3.51472L17.6569 4.22182C17.0711 4.80761 17.0711 5.75736 17.6569 6.34314C18.2426 6.92893 19.1924 6.92893 19.7782 6.34314L20.4853 5.63604C21.0711 5.05025 21.0711 4.1005 20.4853 3.51472Z"></path>
                <path d="M4.22181 17.6569C4.8076 17.0711 5.75734 17.0711 6.34313 17.6569C6.92892 18.2426 6.92892 19.1924 6.34313 19.7782L5.63602 20.4853C5.05024 21.0711 4.10049 21.0711 3.5147 20.4853C2.92892 19.8995 2.92892 18.9497 3.5147 18.364L4.22181 17.6569Z"></path>
                <path d="M3.5147 3.51472C2.92891 4.1005 2.92891 5.05025 3.5147 5.63604L4.22181 6.34315C4.80759 6.92893 5.75734 6.92893 6.34313 6.34315C6.92891 5.75736 6.92891 4.80761 6.34313 4.22183L5.63602 3.51472C5.05023 2.92893 4.10049 2.92893 3.5147 3.51472Z"></path>
                <path d="M17.6569 19.7782C17.0711 19.1924 17.0711 18.2426 17.6569 17.6569C18.2426 17.0711 19.1924 17.0711 19.7782 17.6569L20.4853 18.364C21.0711 18.9497 21.0711 19.8995 20.4853 20.4853C19.8995 21.0711 18.9497 21.0711 18.364 20.4853L17.6569 19.7782Z"></path>
                <path d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z"></path>
              </>
            )}
          </DCustomIcon>
        </button>
        <a
          className="app-layout-header__button"
          href="//github.com/DevCloudFE/react-devui"
          target="_blank"
          rel="noreferrer"
          aria-label={t('GitHub repository')}
        >
          <GithubOutlined dSize={24} />
        </a>
      </div>
    </header>
  );
}
