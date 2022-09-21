import { useTranslation } from 'react-i18next';

import { GithubOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

export function AppFooter(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element | null {
  const { t } = useTranslation();

  return (
    <footer {...props} className={getClassName(props.className, 'app-footer')}>
      <div className="app-footer__col">
        <div className="app-footer__col-title">{t('footer.Resources')}</div>
        <a href="https://rd-platform.surge.sh" target="_blank" rel="noreferrer">
          RD-Platform
        </a>
        <a href="https://devui.design" target="_blank" rel="noreferrer">
          Ng DevUI
        </a>
        <a href="https://vue-devui.github.io" target="_blank" rel="noreferrer">
          Vue DevUI
        </a>
      </div>
      <div className="app-footer__col">
        <div className="app-footer__col-title">{t('footer.Help')}</div>
        <a href="https://github.com/DevCloudFE/react-devui" target="_blank" rel="noreferrer">
          <GithubOutlined />
          GitHub
        </a>
      </div>
      <div className="app-footer__bottom">
        <span>© 2022 made with ❤ by </span>
        <a href="//github.com/xiejay97">Xie Jay</a>
      </div>
    </footer>
  );
}
