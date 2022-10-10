import * as echarts from 'echarts';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Subject } from 'rxjs';

import { useForceUpdate, useUnmount } from '@react-devui/hooks';

export function useEChart<O extends echarts.EChartsOption>() {
  const dataRef = useRef<{
    container: HTMLElement | null;
    instance: echarts.ECharts | null;
    options: O[];
  }>({
    container: null,
    instance: null,
    options: [],
  });

  const forceUpdate = useForceUpdate();

  const onUpdateOption$ = useMemo(() => new Subject<void>(), []);

  const containerRef = useCallback(
    (el: HTMLElement | null) => {
      if (!Object.is(dataRef.current.container, el)) {
        dataRef.current.instance?.dispose();

        if (el) {
          dataRef.current.instance = echarts.init(el);
        }

        forceUpdate();
        onUpdateOption$.next();
      }
      dataRef.current.container = el;
    },
    [forceUpdate, onUpdateOption$]
  );

  const setOption = useCallback(
    (option: O) => {
      dataRef.current.options = dataRef.current.options.concat([option]);
      onUpdateOption$.next();
    },
    [onUpdateOption$]
  );

  useUnmount(() => {
    dataRef.current.instance?.dispose();
  });

  useEffect(() => {
    const ob = onUpdateOption$.subscribe({
      next: () => {
        if (dataRef.current.instance) {
          const lastOption = dataRef.current.options.pop();
          if (lastOption) {
            for (const option of dataRef.current.options) {
              dataRef.current.instance.setOption(option, { lazyUpdate: true });
            }
            dataRef.current.instance.setOption(lastOption);

            dataRef.current.options = [];
          }
        }
      },
    });
    return () => {
      ob.unsubscribe();
    };
  }, [onUpdateOption$]);

  return {
    ref: containerRef,
    setOption,
    instance: dataRef.current.instance,
  };
}
