import type { AppTheme } from '../../../App';

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useLocalStorage } from '@react-devui/hooks';
import { DCustomIcon, MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined } from '@react-devui/icons';

import { AppLanguage } from '../../../components';
import { useDeviceQuery } from '../../../hooks';
import styles from './Header.module.scss';
import { AppNotification } from './notification/Notification';
import { AppUser } from './user/User';

export interface AppHeaderProps {
  sidebarWidth: number;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function AppHeader(props: AppHeaderProps): JSX.Element | null {
  const { sidebarWidth, menuOpen, onMenuOpenChange } = props;

  const textRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const deviceMatched = useDeviceQuery();
  const [theme, setTheme] = useLocalStorage<AppTheme>('theme', 'light');

  useEffect(() => {
    if (menuOpen && textRef.current) {
      const maxWidth = sidebarWidth - 64 - 14;
      if (textRef.current.scrollWidth > maxWidth) {
        textRef.current.style.transform = `scale(${maxWidth / textRef.current.scrollWidth})`;
      } else {
        textRef.current.style.transform = '';
      }
    }
  });

  return (
    <header className={styles['app-header']}>
      <Link className={styles['app-header__logo-container']} to="/">
        <div className={styles['app-header__logo']}>
          <img src="/assets/logo.svg" alt="Logo" width="36" height="36" />
        </div>
        <div
          className={styles['app-header__logo-title-wrapper']}
          style={{ width: deviceMatched !== 'phone' && menuOpen ? sidebarWidth - 64 : 0 }}
        >
          <div className={styles['app-header__logo-title']} ref={textRef}>
            RD-Platform
          </div>
        </div>
      </Link>
      <button
        className={styles['app-header__button']}
        aria-label={t(menuOpen ? 'routes.layout.Fold main navigation' : 'routes.layout.Expand main navigation')}
        onClick={() => {
          onMenuOpenChange(!menuOpen);
        }}
      >
        {menuOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
      </button>
      <button
        className={styles['app-header__button']}
        aria-label={t(theme === 'light' ? 'Dark theme' : 'Light theme')}
        onClick={() => {
          setTheme(theme === 'light' ? 'dark' : 'light');
        }}
      >
        <DCustomIcon viewBox="0 0 24 24">
          {theme === 'light' ? (
            <path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path>
          ) : (
            <path d="M12 9c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"></path>
          )}
        </DCustomIcon>
      </button>
      <button className={styles['app-header__button']} style={{ marginLeft: 'auto' }} aria-label={t('routes.layout.Search')}>
        <SearchOutlined />
      </button>
      <AppNotification className={styles['app-header__button']} />
      <AppUser className={styles['app-header__button']} style={{ gap: '0 8px' }} />
      <AppLanguage className={styles['app-header__button']} />
    </header>
  );
}
