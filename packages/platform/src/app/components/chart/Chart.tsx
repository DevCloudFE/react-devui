import type { AppTheme } from '../../App';

import * as echarts from 'echarts';
import { cloneDeep, merge } from 'lodash';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { useResize, useStorage } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import { STORAGE_KEY } from '../../../config/storage';
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
  //#endregion

  const themeStorage = useStorage<AppTheme>(...STORAGE_KEY.theme);

  const [instance, setInstance] = useState<echarts.ECharts | null>(null);
  const containerRef = useCallback(
    (el: HTMLElement | null) => {
      setInstance((draft) => {
        draft?.dispose();
        return el ? echarts.init(el, themeStorage.value, { renderer: 'svg' }) : null;
      });
    },
    [themeStorage.value]
  );

  useEffect(() => {
    if (instance && aOption) {
      instance.setOption(aOption);
    }
  });

  useResize(elRef, () => {
    if (instance) {
      instance.resize();
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
