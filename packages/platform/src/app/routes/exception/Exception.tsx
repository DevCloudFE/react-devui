import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { DButton } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { useDeviceQuery } from '../../hooks';
import styles from './Exception.module.scss';

export default function Exception(props: { status: number }): JSX.Element | null {
  const { status } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deviceMatched = useDeviceQuery();

  return (
    <div
      className={getClassName(styles['app-exception'], {
        [styles['app-exception--phone']]: deviceMatched === 'phone',
      })}
    >
      <img className={styles['app-exception__bg']} src={`/assets/${status}.svg`} alt="bg" />
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
