import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined } from '@react-devui/icons';

import { AppLanguage } from '../../../components';
import { useDeviceQuery } from '../../../hooks';
import { AppNotification } from './Notification';
import { AppUser } from './User';

export interface AppHeaderProps {
  sidebarWidth: number;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function AppHeader(props: AppHeaderProps): JSX.Element | null {
  const { sidebarWidth, menuOpen, onMenuOpenChange } = props;

  const textRef = useRef<HTMLSpanElement>(null);
  const { t } = useTranslation();
  const deviceMatched = useDeviceQuery();

  useEffect(() => {
    if (menuOpen && textRef.current) {
      const maxWidth = sidebarWidth - 64;
      if (textRef.current.clientWidth > maxWidth) {
        textRef.current.style.cssText = `transform:scale(${maxWidth / textRef.current.clientWidth});`;
      }
    }
  });

  return (
    <header className="app-layout-header">
      <Link className="app-layout-header__logo-container" to="/">
        <div className="app-layout-header__logo">
          <img src="/assets/logo.svg" alt="Logo" width="36" height="36" />
        </div>
        <span
          ref={textRef}
          className="app-layout-header__logo-title"
          style={{ width: deviceMatched !== 'phone' && menuOpen ? sidebarWidth - 64 : 0 }}
        >
          DevUI
        </span>
      </Link>
      <button
        className="app-layout-header__button"
        aria-label={t(menuOpen ? 'routes.layout.Fold main navigation' : 'routes.layout.Expand main navigation')}
        onClick={() => {
          onMenuOpenChange(!menuOpen);
        }}
      >
        {menuOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
      </button>
      <button className="app-layout-header__button" style={{ marginLeft: 'auto' }} aria-label={t('routes.layout.Search')}>
        <SearchOutlined />
      </button>
      <AppNotification />
      <AppUser />
      <AppLanguage className="app-layout-header__button" />
    </header>
  );
}
