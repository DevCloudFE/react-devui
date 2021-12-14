import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DButton, DRow } from '@react-devui/ui';
import { useCustomContext } from '@react-devui/ui/hooks';
import { getClassName } from '@react-devui/ui/utils';

import { AppContext } from '../../App';
import './Header.scss';

export function AppHeader() {
  const { i18n } = useTranslation();

  const [{ menuOpen = false, onMenuOpenChange }] = useCustomContext(AppContext);

  const changeLanguage = useCallback(() => {
    if (i18n.language === 'en-US') {
      i18n.changeLanguage('zh-Hant');
    } else {
      i18n.changeLanguage('en-US');
    }
  }, [i18n]);

  return (
    <header className="app-header is-shadow">
      <DRow
        dAsListener
        dRender={(match, matchs) =>
          matchs.includes('md') ? (
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
          )
        }
      ></DRow>

      <DButton className="app-header__language" dType="secondary" onClick={changeLanguage}>
        {i18n.language === 'en-US' ? '中 文' : 'English'}
      </DButton>
      <a href="//github.com/xiejay97/react-devui" target="_blank" rel="noreferrer">
        <DButton className="app-header__github" dType="text">
          <span className="app-header__github-icon"></span>
        </DButton>
      </a>
    </header>
  );
}
