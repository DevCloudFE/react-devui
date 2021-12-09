import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';

import { useComponentConfig, useRefSelector, useId, useAsync, usePrefixConfig, useImmer } from '../../hooks';

export interface DListRenderProps {
  style: React.CSSProperties;
  'data-virtual-scroll': string;
  onScroll: React.UIEventHandler<HTMLElement>;
  children: React.ReactNode;
}

export interface DItemRenderProps {
  'data-virtual-scroll-reference'?: string;
}

export interface DVirtualScrollProps<T> {
  dListRender: (props: DListRenderProps) => React.ReactNode;
  dWidth?: string | number;
  dHeight?: string | number;
  dItemWidth?: number;
  dItemHeight?: number;
  dList: T[];
  dItemRender: (item: T, index: number, props: DItemRenderProps) => React.ReactNode;
  dCustomSize?: (item: T, index: number) => number;
  onScrollEnd?: () => void;
}

export function DVirtualScroll<T>(props: DVirtualScrollProps<T>) {
  const { dListRender, dWidth, dHeight, dItemWidth, dItemHeight, dList, dItemRender, dCustomSize, onScrollEnd } = useComponentConfig(
    DVirtualScroll.name,
    props
  );

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const asyncCapture = useAsync();
  const id = useId();
  const [list, setList] = useImmer<React.ReactNode[]>([]);
  const [fillSize, setFillSize] = useImmer<[React.CSSProperties, React.CSSProperties]>([{}, {}]);

  const listRef = useRefSelector(`[data-virtual-scroll="${id}"]`);
  const referenceRef = useRefSelector(`[data-virtual-scroll-reference="${id}"]`);

  const itemSize = useMemo(() => (dCustomSize ? dList.map((item, index) => dCustomSize(item, index)) : []), [dCustomSize, dList]);

  const updateList = useCallback(() => {
    if (listRef.current) {
      const scrollSize = isUndefined(dWidth) ? listRef.current.scrollTop : listRef.current.scrollLeft;
      const rect = listRef.current.getBoundingClientRect();
      const size = isUndefined(dWidth) ? dItemHeight ?? rect.height : dItemWidth ?? rect.width;
      if (isUndefined(dCustomSize)) {
        if (referenceRef.current) {
          const itemSize = isUndefined(dWidth)
            ? referenceRef.current.getBoundingClientRect().height
            : referenceRef.current.getBoundingClientRect().width;

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
  }, [
    dCustomSize,
    dItemHeight,
    dItemRender,
    dItemWidth,
    dList,
    dWidth,
    itemSize,
    listRef,
    onScrollEnd,
    referenceRef,
    setFillSize,
    setList,
  ]);

  const reference = useMemo(() => {
    if (dList[0] && isUndefined(dCustomSize)) {
      return dItemRender(dList[0], 0, { 'data-virtual-scroll-reference': String(id) });
    }
  }, [dCustomSize, dItemRender, dList, id]);

  //#region DidUpdate
  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (referenceRef.current) {
      asyncGroup.onResize(referenceRef.current, updateList);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, referenceRef, updateList]);

  useEffect(() => {
    updateList();
  }, [updateList]);
  //#endregion

  const listRenderProps = useMemo<DListRenderProps>(
    () => ({
      style: {
        width: dWidth,
        height: dHeight,
        whiteSpace: isUndefined(dWidth) ? undefined : 'nowrap',
        overflowX: isUndefined(dWidth) ? undefined : 'auto',
        overflowY: isUndefined(dHeight) ? undefined : 'auto',
      },
      'data-virtual-scroll': String(id),
      onScroll: () => {
        flushSync(() => updateList());
      },
      children: (
        <>
          {reference}
          <div
            key={`${dPrefix}virtual-scroll-pre-fill-${id}`}
            style={{
              ...fillSize[0],
              display: isUndefined(dWidth) ? undefined : 'inline-block',
            }}
          ></div>
          {list}
          <div
            key={`${dPrefix}virtual-scroll-sub-fill-${id}`}
            style={{
              ...fillSize[1],
              display: isUndefined(dWidth) ? undefined : 'inline-block',
            }}
          ></div>
        </>
      ),
    }),
    [dHeight, dPrefix, dWidth, fillSize, id, list, reference, updateList]
  );

  return dListRender(listRenderProps);
}
