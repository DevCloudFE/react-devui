import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { DButton } from '@react-devui/ui';

import { AppRoute } from '../../utils';
import { ReactComponent as S403 } from './403.svg';
import { ReactComponent as S404 } from './404.svg';
import { ReactComponent as S500 } from './500.svg';

import styles from './Exception.module.scss';

export default AppRoute(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { status } = useParams();

  return (
    <div className={styles['app-exception']}>
      {React.createElement(status === '403' ? S403 : status === '404' ? S404 : S500, { className: styles['app-exception__bg'] })}
      <div className={styles['app-exception__info']}>
        <div className={styles['app-exception__status']}>{status}</div>
        <div className={styles['app-exception__description']}>{t(`routes.exception.${status}` as any)}</div>
        <DButton
          onClick={() => {
            navigate('/', { replace: true });
          }}
        >
          {t('routes.exception.Back Home')}
        </DButton>
      </div>
    </div>
  );
});
