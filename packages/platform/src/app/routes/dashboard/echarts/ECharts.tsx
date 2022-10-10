import { AppRouteHeader } from '../../../components';
import styles from './ECharts.module.scss';

export default function ECharts(): JSX.Element | null {
  return (
    <>
      <AppRouteHeader>
        <AppRouteHeader.Breadcrumb />
        <AppRouteHeader.Header />
      </AppRouteHeader>
      <div className={styles['app-http']}>
        {/* <DRow>
          <DCol key={index} dSpan={12} dResponsiveProps={{ lg: 6 }}>
            <div className={['app-demo-col', index % 2 ? 'app-demo-col--lighter' : ''].join(' ')}>col</div>
          </DCol>
        </DRow> */}
      </div>
    </>
  );
}
