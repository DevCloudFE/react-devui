import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { DButton } from '@react-devui/ui';

import { ReactComponent as S403 } from './403.svg';
import { ReactComponent as S404 } from './404.svg';
import { ReactComponent as S500 } from './500.svg';
import styles from './Exception.module.scss';

export default function Exception(props: { status: number }): JSX.Element | null {
  const { status } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={styles['app-exception']}>
      {React.createElement(status === 403 ? S403 : status === 404 ? S404 : S500, { className: styles['app-exception__bg'] })}
      <div className={styles['app-exception__info']}>
        <div className={styles['app-exception__status']}>{status}</div>
        <div className={styles['app-exception__description']}>{t(`routes.exception.${status}`)}</div>
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
}
