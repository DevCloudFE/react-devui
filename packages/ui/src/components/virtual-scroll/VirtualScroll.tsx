import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useImmer } from 'use-immer';

import { useDComponentConfig, useElement, useId, useThrottle, useAsync, useDPrefixConfig } from '../../hooks';

export interface DItemRenderProps {
  'data-virtual-scroll-reference'?: string;
}

export interface DVirtualScrollProps<T> {
  dTag?: string;
  dWidth?: string | number;
  dHeight?: string | number;
  dItemWidth?: number;
  dItemHeight?: number;
  dList: T[];
  dItemRender: (item: T, index: number, props: DItemRenderProps) => React.ReactNode;
  dCustomSize?: (item: T, index: number) => number;
  onScrollEnd?: () => void;
  [index: string]: unknown;
}

export function DVirtualScroll<T>(props: DVirtualScrollProps<T>) {
  const {
    dTag = 'div',
    dWidth,
    dHeight,
    dItemWidth,
    dItemHeight,
    dList,
    dItemRender,
    dCustomSize,
    onScrollEnd,
    style,
    onScroll,
    ...restProps
  } = useDComponentConfig('virtual-scroll', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  const { throttleByAnimationFrame } = useThrottle();
  const asyncCapture = useAsync();
  const id = useId();
  const [list, setList] = useImmer<React.ReactNode[]>([]);
  const [fillSize, setFillSize] = useImmer<[React.CSSProperties, React.CSSProperties]>([{}, {}]);

  const listEl = useElement(`[data-virtual-scroll="${id}"]`);
  const referenceEl = useElement(`[data-virtual-scroll-reference="${id}"]`);

  const itemSize = useMemo(() => (dCustomSize ? dList.map((item, index) => dCustomSize(item, index)) : []), [dCustomSize, dList]);

  const updateList = useCallback(() => {
    if (listEl.current) {
      const scrollSize = isUndefined(dWidth) ? listEl.current.scrollTop : listEl.current.scrollLeft;
      const rect = listEl.current.getBoundingClientRect();
      const size = isUndefined(dWidth) ? dItemHeight ?? rect.height : dItemWidth ?? rect.width;
      if (isUndefined(dCustomSize)) {
        if (referenceEl.current) {
          const itemSize = isUndefined(dWidth)
            ? referenceEl.current.getBoundingClientRect().height
            : referenceEl.current.getBoundingClientRect().width;

          if (size && itemSize) {
            const startIndex = Math.max(~~(scrollSize / itemSize) - 2, 1);
            const endIndex = Math.min(~~(scrollSize / itemSize) + ~~(size / itemSize) + 1 + 2, dList.length);
            setList(dList.slice(startIndex, endIndex).map((item, index) => dItemRender(item, startIndex + index, {})));

            setFillSize([
              { [isUndefined(dWidth) ? 'height' : 'width']: Math.max(itemSize * (startIndex - 1), 0) },
              { [isUndefined(dWidth) ? 'height' : 'width']: Math.max(itemSize * (dList.length - 1 - endIndex), 0) },
            ]);
            if (scrollSize + size >= dList.length * itemSize) {
              onScrollEnd?.();
            }
          }
        }
      } else {
        if (size) {
          let accumulateSize = 0;
          let startInfo: [number, number] | undefined;
          let endInfo: [number, number] | undefined;
          for (const [index, value] of itemSize.entries()) {
            accumulateSize += value;
            if (accumulateSize > scrollSize && isUndefined(startInfo)) {
              startInfo = [index, accumulateSize];
            }
            if (accumulateSize > scrollSize + size && isUndefined(endInfo)) {
              endInfo = [index, accumulateSize];
            }
          }

          const startIndex = Math.max((startInfo?.[0] ?? 0) - 2, 0);
          const endIndex = Math.min((endInfo?.[0] ?? dList.length) + 1 + 2, dList.length);
          setList(dList.slice(startIndex, endIndex).map((item, index) => dItemRender(item, startIndex + index, {})));

          const preFillSize = Math.max(
            startInfo
              ? (startInfo[1] ?? 0) - (itemSize[startInfo[0]] ?? 0) - (itemSize[startInfo[0] - 1] ?? 0) - (itemSize[startInfo[0] - 2] ?? 0)
              : 0,
            0
          );
          const sufFillSize = Math.max(
            endInfo ? accumulateSize - endInfo[1] - (itemSize[endInfo[0] + 1] ?? 0) - (itemSize[endInfo[0] + 2] ?? 0) : 0,
            0
          );
          setFillSize([
            { [isUndefined(dWidth) ? 'height' : 'width']: preFillSize },
            { [isUndefined(dWidth) ? 'height' : 'width']: sufFillSize },
          ]);
          if (scrollSize + size >= accumulateSize) {
            onScrollEnd?.();
          }
        }
      }
    }
  }, [listEl, dWidth, dItemHeight, dItemWidth, dCustomSize, referenceEl, dList, setList, setFillSize, dItemRender, onScrollEnd, itemSize]);

  const reference = useMemo(() => {
    if (dList[0] && isUndefined(dCustomSize)) {
      const [asyncGroup] = asyncCapture.createGroup('reference');
      asyncGroup.setTimeout(() => {
        if (referenceEl.current) {
          asyncGroup.onResize(referenceEl.current, () => throttleByAnimationFrame.run(updateList));
        }
      }, 20);

      return dItemRender(dList[0], 0, { 'data-virtual-scroll-reference': String(id) });
    }
  }, [asyncCapture, dCustomSize, dItemRender, dList, id, referenceEl, throttleByAnimationFrame, updateList]);

  const handleScroll = useCallback(
    (e) => {
      (onScroll as React.UIEventHandler<HTMLElement>)?.(e);
      throttleByAnimationFrame.run(updateList);
    },
    [onScroll, throttleByAnimationFrame, updateList]
  );

  //#region DidUpdate
  useEffect(() => {
    throttleByAnimationFrame.run(updateList);
  }, [throttleByAnimationFrame, updateList]);
  //#endregion

  return React.createElement(
    dTag,
    {
      ...restProps,
      style: {
        ...(style as React.CSSProperties),
        width: dWidth,
        height: dHeight,
        whiteSpace: isUndefined(dWidth) ? undefined : 'nowrap',
        overflowX: isUndefined(dWidth) ? undefined : 'auto',
        overflowY: isUndefined(dHeight) ? undefined : 'auto',
      },
      'data-virtual-scroll': String(id),
      onScroll: handleScroll,
    },
    [
      reference,
      <div
        key={`${dPrefix}virtual-scroll-pre-fill-${id}`}
        style={{
          ...fillSize[0],
          display: isUndefined(dWidth) ? undefined : 'inline-block',
        }}
      ></div>,
      ...list,
      <div
        key={`${dPrefix}virtual-scroll-sub-fill-${id}`}
        style={{
          ...fillSize[1],
          display: isUndefined(dWidth) ? undefined : 'inline-block',
        }}
      ></div>,
    ]
  );
}
