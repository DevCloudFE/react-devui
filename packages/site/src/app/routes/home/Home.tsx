import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ArrowRightOutlined, GithubOutlined } from '@react-devui/icons';
import { DButton } from '@react-devui/ui';

import './Home.scss';

export function Home() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'React DevUI';
  }, []);

  return (
    <main className="app-home">
      <img className="app-home__img" src="/assets/imgs/home-logo.svg" alt="logo" />
      <div className="app-home__title">React DevUI</div>
      <div className="app-home__description">{t('home.Title')}</div>
      <Link className="app-home__button-link" to="/docs/GettingStarted">
        <DButton dIcon={<ArrowRightOutlined />} dIconRight>
          {t('home.Getting Started')}
        </DButton>
      </Link>
      <footer className="app-home__footer">
        <div className="app-home__col">
          <div className="app-home__col-title">{t('home.Resources')}</div>
          <a href="https://devui.design" target="_blank" rel="noreferrer">
            Ng DevUI
          </a>
          <a href="https://vue-devui.github.io" target="_blank" rel="noreferrer">
            Vue DevUI
          </a>
        </div>
        <div className="app-home__col">
          <div className="app-home__col-title">{t('home.Help')}</div>
          <a href="https://github.com/DevCloudFE/react-devui" target="_blank" rel="noreferrer">
            <GithubOutlined />
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
