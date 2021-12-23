import { isNumber, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useId } from 'react';
import { useRef } from 'react';
import { flushSync } from 'react-dom';

import { useComponentConfig, useRefSelector, useAsync, usePrefixConfig, useImmer } from '../../hooks';
import { getNoTransformElSize, toPx } from '../../utils';

export interface DListRenderProps {
  [key: `data-${string}virtual-scroll`]: string;
  onScroll: React.UIEventHandler<HTMLElement>;
  children: React.ReactNode;
}

export interface DItemRenderProps {
  'aria-setsize': number;
  'aria-posinset': number;
  [key: `data-${string}virtual-scroll-reference`]: string;
}

export interface DVirtualScrollProps<T> {
  dListRender: (props: DListRenderProps) => React.ReactNode;
  dScrollY?: boolean;
  dWidth?: number;
  dHeight?: number;
  dItemWidth?: number;
  dItemHeight?: number;
  dList: T[];
  dItemRender: (item: T, index: number, props: DItemRenderProps) => React.ReactNode;
  dCustomSize?: (item: T, index: number) => number;
  onScrollEnd?: () => void;
}

export function DVirtualScroll<T>(props: DVirtualScrollProps<T>) {
  const {
    dListRender,
    dScrollY = true,
    dWidth,
    dHeight,
    dItemWidth,
    dItemHeight,
    dList,
    dItemRender,
    dCustomSize,
    onScrollEnd,
  } = useComponentConfig(DVirtualScroll.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const dataRef = useRef({
    isFirst: true,
  });

  const asyncCapture = useAsync();
  const uniqueId = useId();
  const [list, setList] = useImmer<React.ReactNode[]>([]);
  const [fillSize, setFillSize] = useImmer<[React.CSSProperties, React.CSSProperties]>([{}, {}]);

  const listRef = useRefSelector(`[data-${dPrefix}virtual-scroll="${uniqueId}"]`);
  const referenceRef = useRefSelector(`[data-${dPrefix}virtual-scroll-reference="${uniqueId}"]`);

  const autoCalculate = isUndefined(dCustomSize) && !(dScrollY && isNumber(dItemHeight)) && !(!dScrollY && isNumber(dItemWidth));
  const itemSize = useMemo(() => (dCustomSize ? dList.map((item, index) => dCustomSize(item, index)) : []), [dCustomSize, dList]);

  const updateList = useCallback(() => {
    if (listRef.current) {
      const {
        paddingTop: _paddingTop,
        paddingRight: _paddingRight,
        paddingBottom: _paddingBottom,
        paddingLeft: _paddingLeft,
      } = getComputedStyle(listRef.current);
      const paddingTop = toPx(_paddingTop, true);
      const paddingRight = toPx(_paddingRight, true);
      const paddingBottom = toPx(_paddingBottom, true);
      const paddingLeft = toPx(_paddingLeft, true);

      const size = dScrollY ? dHeight ?? listRef.current.clientHeight : dWidth ?? listRef.current.clientWidth;
      const padding = dScrollY ? [paddingTop, paddingBottom] : [paddingLeft, paddingRight];
      const rect = listRef.current.getBoundingClientRect();
      if (size !== 0 && (dataRef.current.isFirst || (rect.width !== 0 && rect.height !== 0))) {
        dataRef.current.isFirst = false;

        if (isUndefined(dCustomSize)) {
          let itemSize = 0;
          if (autoCalculate) {
            if (referenceRef.current) {
              const { width, height } = getNoTransformElSize(referenceRef.current);
              itemSize = dScrollY ? height : width;
            }
          } else {
            itemSize = dScrollY ? (dItemHeight as number) : (dItemWidth as number);
          }
          if (itemSize !== 0) {
            const maxScrollSize = itemSize * dList.length + padding.reduce((a, b) => a + b, 0) - listRef.current.clientHeight;
            const scrollSize = Math.min(maxScrollSize, dScrollY ? listRef.current.scrollTop : listRef.current.scrollLeft);

            const startIndex = Math.max(Math.floor((scrollSize - padding[0]) / itemSize) - 2, autoCalculate ? 1 : 0);
            const endIndex = Math.min(Math.ceil((scrollSize - padding[0] + size) / itemSize) + 2, dList.length);
            setList(
              dList.slice(startIndex, endIndex).map((item, index) =>
                dItemRender(item, startIndex + index, {
                  'aria-setsize': dList.length,
                  'aria-posinset': startIndex + index + 1,
                })
              )
            );

            setFillSize([
              { [dScrollY ? 'height' : 'width']: itemSize * (startIndex - (autoCalculate ? 1 : 0)) },
              { [dScrollY ? 'height' : 'width']: itemSize * (dList.length - endIndex) },
            ]);
          }
        } else {
          let accumulateSize = 0;
          let startInfo: [number, number] | undefined;
          let endInfo: [number, number] | undefined;

          const maxScrollSize = itemSize.reduce((a, b) => a + b, 0) + padding.reduce((a, b) => a + b, 0) - listRef.current.clientHeight;
          const scrollSize = Math.min(maxScrollSize, dScrollY ? listRef.current.scrollTop : listRef.current.scrollLeft);

          for (const [index, value] of itemSize.entries()) {
            accumulateSize += value;
            if (accumulateSize > scrollSize - padding[0] && isUndefined(startInfo)) {
              startInfo = [index, accumulateSize];
            }
            if (accumulateSize > scrollSize - padding[0] + size && isUndefined(endInfo)) {
              endInfo = [index, accumulateSize];
            }
          }

          const startIndex = Math.max((startInfo?.[0] ?? 0) - 2, 0);
          const endIndex = Math.min((endInfo?.[0] ?? dList.length) + 1 + 2, dList.length);
          setList(
            dList.slice(startIndex, endIndex).map((item, index) =>
              dItemRender(item, startIndex + index, {
                'aria-setsize': dList.length,
                'aria-posinset': startIndex + index + 1,
              })
            )
          );

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
          setFillSize([{ [dScrollY ? 'height' : 'width']: preFillSize }, { [dScrollY ? 'height' : 'width']: sufFillSize }]);
        }
      }
    }
  }, [
    autoCalculate,
    dCustomSize,
    dHeight,
    dItemHeight,
    dItemRender,
    dItemWidth,
    dList,
    dScrollY,
    dWidth,
    itemSize,
    listRef,
    referenceRef,
    setFillSize,
    setList,
  ]);

  const reference = useMemo(() => {
    if (dList[0] && autoCalculate) {
      return dItemRender(dList[0], 0, {
        'aria-setsize': dList.length,
        'aria-posinset': 1,
        [`data-${dPrefix}virtual-scroll-reference`]: uniqueId,
      } as DItemRenderProps);
    }
  }, [autoCalculate, dItemRender, dList, dPrefix, uniqueId]);

  //#region DidUpdate
  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (referenceRef.current) {
      asyncGroup.onResize(referenceRef.current, updateList, false);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, referenceRef, updateList]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (listRef.current) {
      asyncGroup.onResize(listRef.current, updateList, false);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, listRef, updateList]);

  useEffect(() => {
    updateList();
  }, [updateList]);
  //#endregion

  const listRenderProps = useMemo(
    () =>
      ({
        [`data-${dPrefix}virtual-scroll`]: uniqueId,
        onScroll: () => {
          flushSync(() => updateList());
          asyncCapture.requestAnimationFrame(() => {
            if (listRef.current) {
              if (
                (dScrollY && listRef.current.scrollTop + listRef.current.clientHeight === listRef.current.scrollHeight) ||
                (!dScrollY && listRef.current.scrollLeft + listRef.current.clientWidth === listRef.current.scrollWidth)
              ) {
                onScrollEnd?.();
              }
            }
          });
        },
        children: (
          <>
            {reference}
            <div
              key={`${dPrefix}virtual-scroll-pre-fill-${uniqueId}`}
              style={{
                ...fillSize[0],
                display: dScrollY ? undefined : 'inline-block',
              }}
              aria-hidden={true}
            ></div>
            {list}
            <div
              key={`${dPrefix}virtual-scroll-sub-fill-${uniqueId}`}
              style={{
                ...fillSize[1],
                display: dScrollY ? undefined : 'inline-block',
              }}
              aria-hidden={true}
            ></div>
          </>
        ),
      } as DListRenderProps),
    [dPrefix, uniqueId, reference, fillSize, dScrollY, list, asyncCapture, updateList, listRef, onScrollEnd]
  );

  return <>{dListRender(listRenderProps)}</>;
}
