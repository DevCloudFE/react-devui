import type { AppTheme } from '../../utils/types';

import * as echarts from 'echarts';
import { cloneDeep, merge } from 'lodash';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { useAsync, useResize, useStorage } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import { STORAGE_KEY } from '../../config/storage';
import chartTheme from './theme.json';

echarts.registerTheme('light', chartTheme.light);
echarts.registerTheme('dark', merge(cloneDeep(chartTheme.light), chartTheme.dark));

export interface AppChartProps<O extends echarts.EChartsOption> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aOption: O | null;
}

function Chart<O extends echarts.EChartsOption>(props: AppChartProps<O>, ref: React.ForwardedRef<echarts.ECharts>): JSX.Element | null {
  const {
    aOption,

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

  const themeStorage = useStorage<AppTheme>(...STORAGE_KEY.theme);

  const [instance, setInstance] = useState<echarts.ECharts | null>(null);

  useEffect(() => {
    const instance = containerRef.current ? echarts.init(containerRef.current, themeStorage.value, { renderer: 'svg' }) : null;
    setInstance(instance);
    return () => {
      instance?.dispose();
    };
  }, [themeStorage.value]);

  useEffect(() => {
    if (instance && aOption) {
      instance.setOption(aOption);
    }
  }, [aOption, instance]);

  useResize(elRef, () => {
    if (instance) {
      dataRef.current.clearTid?.();
      dataRef.current.clearTid = async.setTimeout(() => {
        dataRef.current.clearTid = undefined;
        instance.resize({ animation: { duration: 200 } });
      }, 100);
    }
  });

  useImperativeHandle<echarts.ECharts | null, echarts.ECharts | null>(ref, () => instance, [instance]);

  return (
    <div {...restProps} ref={elRef} className={getClassName(restProps.className, 'app-chart')}>
      <div ref={containerRef} className="app-chart__container"></div>
    </div>
  );
}

export const AppChart = React.forwardRef(Chart);
