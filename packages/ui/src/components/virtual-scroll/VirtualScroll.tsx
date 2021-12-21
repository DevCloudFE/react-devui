/* eslint-disable @typescript-eslint/no-explicit-any */
import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';

import { useComponentConfig, useRefSelector, useId, useAsync, usePrefixConfig, useImmer } from '../../hooks';
import { getNoTransformElSize } from '../../utils';

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

export interface DVirtualScrollProps {
  dListRender: (props: DListRenderProps) => React.ReactNode;
  dScrollY?: boolean;
  dItemWidth?: number;
  dItemHeight?: number;
  dList: any[];
  dItemRender: (item: any, index: number, props: DItemRenderProps) => React.ReactNode;
  dCustomSize?: (item: any, index: number) => number;
  onScrollEnd?: () => void;
}

export function DVirtualScroll(props: DVirtualScrollProps) {
  const {
    dListRender,
    dScrollY = true,
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

  const asyncCapture = useAsync();
  const id = useId();
  const [list, setList] = useImmer<React.ReactNode[]>([]);
  const [fillSize, setFillSize] = useImmer<[React.CSSProperties, React.CSSProperties]>([{}, {}]);

  const listRef = useRefSelector(`[data-${dPrefix}virtual-scroll="${id}"]`);
  const referenceRef = useRefSelector(`[data-${dPrefix}virtual-scroll-reference="${id}"]`);

  const itemSize = useMemo(() => (dCustomSize ? dList.map((item, index) => dCustomSize(item, index)) : []), [dCustomSize, dList]);

  const updateList = useCallback(() => {
    if (listRef.current) {
      const scrollSize = dScrollY ? listRef.current.scrollTop : listRef.current.scrollLeft;
      const size = dScrollY ? listRef.current.clientHeight : listRef.current.clientWidth;
      if (size !== 0) {
        if (isUndefined(dCustomSize)) {
          if (referenceRef.current) {
            const itemSize = dScrollY
              ? dItemHeight ?? getNoTransformElSize(referenceRef.current).height
              : dItemWidth ?? getNoTransformElSize(referenceRef.current).width;

            if (size && itemSize) {
              const startIndex = Math.max(~~(scrollSize / itemSize) - 2, 1);
              const endIndex = Math.min(~~(scrollSize / itemSize) + ~~(size / itemSize) + 1 + 2, dList.length);
              setList(
                dList.slice(startIndex, endIndex).map((item, index) =>
                  dItemRender(item, startIndex + index, {
                    'aria-setsize': dList.length,
                    'aria-posinset': startIndex + index + 1,
                  })
                )
              );

              setFillSize([
                { [dScrollY ? 'height' : 'width']: Math.max(itemSize * (startIndex - 1), 0) },
                { [dScrollY ? 'height' : 'width']: Math.max(itemSize * (dList.length - 1 - endIndex), 0) },
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
                ? (startInfo[1] ?? 0) -
                    (itemSize[startInfo[0]] ?? 0) -
                    (itemSize[startInfo[0] - 1] ?? 0) -
                    (itemSize[startInfo[0] - 2] ?? 0)
                : 0,
              0
            );
            const sufFillSize = Math.max(
              endInfo ? accumulateSize - endInfo[1] - (itemSize[endInfo[0] + 1] ?? 0) - (itemSize[endInfo[0] + 2] ?? 0) : 0,
              0
            );
            setFillSize([{ [dScrollY ? 'height' : 'width']: preFillSize }, { [dScrollY ? 'height' : 'width']: sufFillSize }]);
            if (scrollSize + size >= accumulateSize) {
              onScrollEnd?.();
            }
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
    dScrollY,
    itemSize,
    listRef,
    onScrollEnd,
    referenceRef,
    setFillSize,
    setList,
  ]);

  const reference = useMemo(() => {
    if (dList[0] && isUndefined(dCustomSize)) {
      return dItemRender(dList[0], 0, {
        'aria-setsize': dList.length,
        'aria-posinset': 1,
        [`data-${dPrefix}virtual-scroll-reference`]: String(id),
      } as DItemRenderProps);
    }
  }, [dCustomSize, dItemRender, dList, dPrefix, id]);

  //#region DidUpdate
  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (listRef.current && referenceRef.current) {
      asyncGroup.onResize(listRef.current, updateList, false);
      asyncGroup.onResize(referenceRef.current, updateList, false);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, listRef, referenceRef, updateList]);

  useEffect(() => {
    updateList();
  }, [updateList]);
  //#endregion

  const listRenderProps = useMemo(
    () =>
      ({
        [`data-${dPrefix}virtual-scroll`]: String(id),
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
                display: dScrollY ? undefined : 'inline-block',
              }}
              aria-hidden={true}
            ></div>
            {list}
            <div
              key={`${dPrefix}virtual-scroll-sub-fill-${id}`}
              style={{
                ...fillSize[1],
                display: dScrollY ? undefined : 'inline-block',
              }}
              aria-hidden={true}
            ></div>
          </>
        ),
      } as DListRenderProps),
    [dPrefix, dScrollY, fillSize, id, list, reference, updateList]
  );

  return <>{dListRender(listRenderProps)}</>;
}
