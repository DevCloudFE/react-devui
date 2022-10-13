import { useState } from 'react';

import { useMount } from '@react-devui/hooks';
import { DCard } from '@react-devui/ui';

import { AppChart, AppRouteHeader } from '../../../components';
import styles from './ECharts.module.scss';
import { getOptions } from './options';

export default function ECharts(): JSX.Element | null {
  const [options, setOptions] = useState<echarts.EChartsOption[]>([]);

  useMount(() => {
    setOptions(getOptions() as echarts.EChartsOption[]);
  });

  return (
    <>
      <AppRouteHeader>
        <AppRouteHeader.Breadcrumb />
        <AppRouteHeader.Header />
      </AppRouteHeader>
      <div className={styles['app-echarts']}>
        <div className="row" style={{ gap: 'var(--bs-gutter-x) 0' }}>
          {options.map((option, index) => (
            <div key={index} className="col-12 col-xxl-6">
              <DCard>
                <DCard.Content>
                  <AppChart style={{ height: 320 }} aOption={option} />
                </DCard.Content>
              </DCard>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
