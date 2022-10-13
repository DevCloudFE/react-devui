import type { AppTheme } from '../../App';

import * as echarts from 'echarts';
import { cloneDeep, merge } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useAsync, useResize, useStorage } from '@react-devui/hooks';
import { setRef } from '@react-devui/hooks/useForkRef';
import { getClassName } from '@react-devui/utils';

import { STORAGE_KEY } from '../../../config/storage';
import chartTheme from './theme.json';

echarts.registerTheme('light', chartTheme.light);
echarts.registerTheme('dark', merge(cloneDeep(chartTheme.light), chartTheme.dark));

export interface AppEChartsProps<O extends echarts.EChartsOption> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aOption: O | null;
}

function ECharts<O extends echarts.EChartsOption>(props: AppEChartsProps<O>, ref: React.ForwardedRef<echarts.ECharts>): JSX.Element | null {
  const {
    aOption,

    ...restProps
  } = props;

  //#region Ref
  const elRef = useRef<HTMLDivElement>(null);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const async = useAsync();

  const themeStorage = useStorage<AppTheme>(...STORAGE_KEY.theme);

  const [instance, setInstance] = useState<echarts.ECharts | null>(null);
  const containerRef = useCallback(
    (el: HTMLElement | null) => {
      setInstance((draft) => {
        draft?.dispose();
        const instance = el ? echarts.init(el, themeStorage.value, { renderer: 'svg' }) : null;
        setRef(ref, instance);
        return instance;
      });
    },
    [ref, themeStorage.value]
  );

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

  return (
    <div {...restProps} ref={elRef} className={getClassName(restProps.className, 'app-echarts')}>
      <div ref={containerRef} className="app-echarts__container"></div>
    </div>
  );
}

export const AppECharts = React.forwardRef(ECharts);
