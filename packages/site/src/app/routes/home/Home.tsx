import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ArrowRightOutlined } from '@react-devui/icons';
import { DButton } from '@react-devui/ui';

import { AppFooter } from '../../components';
import { ReactComponent as Bg } from './bg.svg';

export default function Home(): JSX.Element | null {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'React DevUI';
  }, []);

  return (
    <main className="app-home-route">
      <Bg className="app-home-route__bg" />
      <div className="app-home-route__title">React DevUI</div>
      <div className="app-home-route__description">{t('home.Title')}</div>
      <Link className="app-home-route__button-link" to="/docs/GettingStarted">
        <DButton dIcon={<ArrowRightOutlined />} dIconRight>
          {t('home.Getting Started')}
        </DButton>
      </Link>
      <AppFooter style={{ flexGrow: 1, margin: '40px -20px -20px' }} />
    </main>
  );
}
