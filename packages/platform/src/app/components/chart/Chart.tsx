import type { AppTheme } from '../../utils/types';

import * as echarts from 'echarts';
import { cloneDeep, merge } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { useAsync, useResize } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import chartTheme from './theme.json';

export interface AppChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aRenderer?: 'canvas' | 'svg';
  onInit: (instance: echarts.ECharts) => void;
}

export function AppChart(props: AppChartProps): JSX.Element | null {
  const {
    aRenderer = 'canvas',
    onInit,

    ...restProps
  } = props;

  //#region Ref
  const elRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const async = useAsync();

  const [theme, setTheme] = useState<AppTheme | null>(null);

  useEffect(() => {
    for (const theme of ['light', 'dark'] as const) {
      if (document.body.className.includes(theme)) {
        setTheme(theme);
        break;
      }
    }

    const observer = new MutationObserver(() => {
      setTheme(document.body.className.includes('dark') ? 'dark' : 'light');
    });
    observer.observe(document.body, { attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (containerRef.current && theme) {
      const instance = echarts.init(
        containerRef.current,
        JSON.parse(
          JSON.stringify(theme === 'light' ? chartTheme.light : merge(cloneDeep(chartTheme.light), chartTheme.dark)).replace(
            /var\((.+?)\)/g,
            (match, p1) => {
              return getComputedStyle(document.body).getPropertyValue(p1);
            }
          )
        ),
        { renderer: aRenderer }
      );
      onInit(instance);
      return () => {
        instance.dispose();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aRenderer, theme]);

  useResize(elRef, () => {
    dataRef.current.clearTid?.();
    dataRef.current.clearTid = async.setTimeout(() => {
      dataRef.current.clearTid = undefined;
      if (containerRef.current) {
        const instance = echarts.getInstanceByDom(containerRef.current);
        instance?.resize({ animation: { duration: 200 } });
      }
    }, 100);
  });

  return (
    <div {...restProps} ref={elRef} className={getClassName(restProps.className, 'app-chart')}>
      <div ref={containerRef} className="app-chart__container"></div>
    </div>
  );
}
