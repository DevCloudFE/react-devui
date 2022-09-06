import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ArrowRightOutlined, GithubOutlined } from '@react-devui/icons';
import { DButton } from '@react-devui/ui';

export default function Home(): JSX.Element | null {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'React DevUI';
  }, []);

  return (
    <main className="app-home-route">
      <img className="app-home-route__img" src="/assets/imgs/home-logo.svg" alt="logo" />
      <div className="app-home-route__title">React DevUI</div>
      <div className="app-home-route__description">{t('home.Title')}</div>
      <Link className="app-home-route__button-link" to="/docs/GettingStarted">
        <DButton dIcon={<ArrowRightOutlined />} dIconRight>
          {t('home.Getting Started')}
        </DButton>
      </Link>
      <footer className="app-home-route__footer">
        <div className="app-home-route__col">
          <div className="app-home-route__col-title">{t('home.Resources')}</div>
          <a href="https://devui.design" target="_blank" rel="noreferrer">
            Ng DevUI
          </a>
          <a href="https://vue-devui.github.io" target="_blank" rel="noreferrer">
            Vue DevUI
          </a>
        </div>
        <div className="app-home-route__col">
          <div className="app-home-route__col-title">{t('home.Help')}</div>
          <a href="https://github.com/DevCloudFE/react-devui" target="_blank" rel="noreferrer">
            <GithubOutlined />
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
