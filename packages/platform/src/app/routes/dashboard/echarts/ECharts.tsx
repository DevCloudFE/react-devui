import { useTranslation } from 'react-i18next';

import { DCard } from '@react-devui/ui';

import { AppChart, AppRouteHeader } from '../../../components';
import { AppRoute } from '../../../utils';
import { barOptions, lineOptions, nightingaleOptions, pieOptions, scatterOptions, stackedBarOptions, stackedLineOptions } from './options';

import styles from './ECharts.module.scss';

const ECharts = AppRoute(() => {
  const { t } = useTranslation();

  return (
    <>
      <AppRouteHeader>
        <AppRouteHeader.Breadcrumb
          aList={[
            { id: '/dashboard', title: t('Dashboard', { ns: 'title' }) },
            { id: '/dashboard/echarts', title: t('ECharts', { ns: 'title' }) },
          ]}
        />
        <AppRouteHeader.Header />
      </AppRouteHeader>
      <div className={styles['app-echarts']}>
        <div className="row" style={{ gap: 'var(--bs-gutter-x) 0' }}>
          {[lineOptions, stackedLineOptions, barOptions, stackedBarOptions, pieOptions, nightingaleOptions, scatterOptions].map(
            (option, index) => (
              <div key={index} className="col-12 col-xxl-6">
                <DCard>
                  <DCard.Content>
                    <AppChart
                      style={{ height: 320 }}
                      onInit={(instance) => {
                        instance.setOption(option);
                      }}
                    />
                  </DCard.Content>
                </DCard>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
});

export default ECharts;
