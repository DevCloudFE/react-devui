import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DButton, DIcon, useMediaMatch } from '@react-devui/ui';
import { useCustomContext } from '@react-devui/ui/hooks';
import { getClassName } from '@react-devui/ui/utils';

import { AppContext } from '../../App';
import './Header.scss';

export function AppHeader() {
  const { i18n } = useTranslation();

  const [{ theme, changeTheme: _changeTheme, menuOpen = false, onMenuOpenChange }] = useCustomContext(AppContext);

  const changeLanguage = useCallback(() => {
    i18n.changeLanguage(i18n.language === 'en-US' ? 'zh-Hant' : 'en-US');
  }, [i18n]);

  const changeTheme = useCallback(() => {
    _changeTheme?.(theme === 'light' ? 'dark' : 'light');
  }, [_changeTheme, theme]);

  const mediaMatch = useMediaMatch();

  return (
    <header className="app-header is-shadow">
      {mediaMatch.includes('md') ? (
        <div className="app-header__logo-container">
          <img className="app-header__logo" src="/assets/logo.svg" alt="Logo" width="36" height="36" />
          <span className="app-header__title">DevUI</span>
        </div>
      ) : (
        <DButton className="app-header__menu-button" dType="text" onClick={() => onMenuOpenChange?.(!menuOpen)}>
          <div
            className={getClassName('hamburger', {
              'is-active': menuOpen,
            })}
          >
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </div>
        </DButton>
      )}

      <DButton className="app-header__language" dType="secondary" onClick={changeLanguage}>
        {i18n.language === 'en-US' ? '中 文' : 'English'}
      </DButton>
      <DButton
        className="app-header__button"
        dType="text"
        dIcon={
          <DIcon viewBox="0 0 24 24" dSize={24}>
            {theme === 'light' ? (
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
          </DIcon>
        }
        onClick={changeTheme}
      ></DButton>
      <a href="//github.com/xiejay97/react-devui" target="_blank" rel="noreferrer">
        <DButton
          className="app-header__button"
          dType="text"
          dIcon={
            <DIcon viewBox="0 0 24 24" dSize={24}>
              <path d="M12.0101 1C5.92171 1 1 5.92171 1 12.0101C1 16.8771 4.15354 20.9967 8.5284 22.455C9.07526 22.5644 9.27577 22.218 9.27577 21.9264C9.27577 21.6712 9.25754 20.7962 9.25754 19.8848C6.19514 20.541 5.55714 18.5723 5.55714 18.5723C5.06497 17.2963 4.33583 16.9682 4.33583 16.9682C3.33326 16.2938 4.40874 16.2938 4.40874 16.2938C5.52069 16.3667 6.104 17.4239 6.104 17.4239C7.08834 19.101 8.67423 18.627 9.31223 18.3354C9.40337 17.6245 9.69503 17.1323 10.0049 16.8589C7.56229 16.6037 4.99206 15.6558 4.99206 11.4267C4.99206 10.2237 5.42954 9.23931 6.12223 8.47371C6.01286 8.20028 5.63006 7.07011 6.2316 5.55714C6.2316 5.55714 7.16126 5.26548 9.25754 6.68731C10.1325 6.45034 11.0804 6.32274 12.0101 6.32274C12.9397 6.32274 13.8876 6.45034 14.7626 6.68731C16.8589 5.26548 17.7885 5.55714 17.7885 5.55714C18.3901 7.07011 18.0073 8.20028 17.8979 8.47371C18.6088 9.23931 19.0281 10.2237 19.0281 11.4267C19.0281 15.6558 16.4578 16.5854 13.997 16.8589C14.398 17.2052 14.7443 17.8614 14.7443 18.9004C14.7443 20.377 14.7261 21.5618 14.7261 21.9264C14.7261 22.218 14.9266 22.5644 15.4735 22.455C19.8483 20.9967 23.0019 16.8771 23.0019 12.0101C23.0201 5.92171 18.0802 1 12.0101 1Z"></path>
              <path d="M5.17419 16.8042C5.15596 16.8589 5.06482 16.8771 4.99191 16.8406C4.91899 16.8042 4.86431 16.7313 4.90076 16.6766C4.91899 16.6219 5.01014 16.6037 5.08305 16.6401C5.15596 16.6766 5.19242 16.7495 5.17419 16.8042ZM5.61168 17.2964C5.55699 17.351 5.44762 17.3146 5.39294 17.2417C5.32002 17.1688 5.30179 17.0594 5.35648 17.0047C5.41116 16.95 5.50231 16.9865 5.57522 17.0594C5.64814 17.1505 5.66636 17.2599 5.61168 17.2964ZM6.04916 17.9344C5.97625 17.989 5.86688 17.9344 5.81219 17.8432C5.73928 17.7521 5.73928 17.6245 5.81219 17.588C5.88511 17.5333 5.99448 17.588 6.04916 17.6792C6.12208 17.7703 6.12208 17.8797 6.04916 17.9344ZM6.65071 18.5541C6.59602 18.627 6.46842 18.6088 6.35905 18.5177C6.26791 18.4265 6.23145 18.2989 6.30436 18.2442C6.35905 18.1713 6.48665 18.1896 6.59602 18.2807C6.68716 18.3536 6.70539 18.4812 6.65071 18.5541ZM7.47099 18.9005C7.45276 18.9916 7.32516 19.0281 7.19756 18.9916C7.06996 18.9552 6.99705 18.8458 7.01528 18.7729C7.03351 18.6817 7.16111 18.6453 7.28871 18.6817C7.41631 18.7182 7.48922 18.8093 7.47099 18.9005ZM8.36419 18.9734C8.36419 19.0645 8.25482 19.1374 8.12722 19.1374C7.99962 19.1374 7.89025 19.0645 7.89025 18.9734C7.89025 18.8822 7.99962 18.8093 8.12722 18.8093C8.25482 18.8093 8.36419 18.8822 8.36419 18.9734ZM9.20271 18.8276C9.22093 18.9187 9.12979 19.0098 9.00219 19.0281C8.87459 19.0463 8.76522 18.9916 8.74699 18.9005C8.72876 18.8093 8.81991 18.7182 8.94751 18.7C9.07511 18.6817 9.18448 18.7364 9.20271 18.8276Z"></path>
            </DIcon>
          }
        ></DButton>
      </a>
    </header>
  );
}
