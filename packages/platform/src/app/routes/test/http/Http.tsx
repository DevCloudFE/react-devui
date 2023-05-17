import { useTranslation } from 'react-i18next';

import { DButton, DCard } from '@react-devui/ui';

import { AppRouteHeader } from '../../../components';
import { useHttp } from '../../../core';
import { AppRoute } from '../../../utils';

import styles from './Http.module.scss';

export default AppRoute(() => {
  const http = useHttp();
  const { t } = useTranslation();

  return (
    <>
      <AppRouteHeader>
        <AppRouteHeader.Breadcrumb
          aList={[
            { id: '/test', title: t('Test', { ns: 'title' }) },
            { id: '/test/http', title: t('Http', { ns: 'title' }) },
          ]}
        />
        <AppRouteHeader.Header />
      </AppRouteHeader>
      <div className={styles['app-http']}>
        <DCard>
          <DCard.Content>
            <div className={styles['app-http__button-container']}>
              {[401, 403, 404, 500].map((status) => (
                <DButton
                  key={status}
                  onClick={() => {
                    http({
                      url: '/test/http',
                      method: 'post',
                      data: { status },
                    }).subscribe();
                  }}
                >
                  {status}
                </DButton>
              ))}
            </div>
          </DCard.Content>
        </DCard>
      </div>
    </>
  );
});
