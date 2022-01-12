import { isArray } from 'lodash';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useImmer } from '../../hooks';
import { toPx } from '../../utils';

export interface DItemRenderProps {
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  children?: React.ReactNode;
}

export interface DVirtualScrollProps<T> extends React.HTMLAttributes<HTMLElement> {
  dListRef?: (node: HTMLUListElement | null) => void;
  dScrollY?: boolean;
  dSize: number;
  dItemSize: number;
  dList: T[];
  dItemRender: (item: T, index: number, props: DItemRenderProps) => React.ReactNode;
  dNestedKey?: string;
  dStopUpdate?: boolean;
  onScrollEnd?: () => void;
}

export function DVirtualScroll<T>(props: DVirtualScrollProps<T>) {
  const {
    dListRef,
    dScrollY = true,
    dSize,
    dItemSize,
    dList,
    dItemRender,
    dNestedKey,
    dStopUpdate = false,
    onScrollEnd,
    onScroll,
    ...restProps
  } = props;

  //#region Ref
  const [listEl, setListEl] = useState<HTMLUListElement | null>(null);

  const listRef = useCallback(
    (node: HTMLUListElement | null) => {
      setListEl(node);
      dListRef?.(node);
    },
    [dListRef]
  );
  //#endregion

  const dataRef = useRef<{
    isFirst: boolean;
  }>({
    isFirst: true,
  });

  const [list, setList] = useImmer<React.ReactNode[]>([]);
  const [fillSize, setFillSize] = useImmer<[React.CSSProperties, React.CSSProperties]>([{}, {}]);

  const updateList = useCallback(() => {
    if (listEl) {
      dataRef.current.isFirst = false;

      const {
        paddingTop: _paddingTop,
        paddingRight: _paddingRight,
        paddingBottom: _paddingBottom,
        paddingLeft: _paddingLeft,
      } = getComputedStyle(listEl);
      const paddingTop = toPx(_paddingTop, true);
      const paddingRight = toPx(_paddingRight, true);
      const paddingBottom = toPx(_paddingBottom, true);
      const paddingLeft = toPx(_paddingLeft, true);

      const padding = dScrollY ? [paddingTop, paddingBottom] : [paddingLeft, paddingRight];

      let allLength = 0;
      const getAllLength = (arr: T[]) => {
        allLength += arr.length;
        arr.forEach((item) => {
          if (dNestedKey && isArray(item[dNestedKey])) {
            getAllLength(item[dNestedKey]);
          }
        });
      };
      getAllLength(dList);
      const maxScrollSize = dItemSize * allLength + padding.reduce((a, b) => a + b, 0) - dSize;
      const scrollSize = Math.min(maxScrollSize, dScrollY ? listEl.scrollTop : listEl.scrollLeft);

      const startCount = Math.floor((scrollSize - padding[0]) / dItemSize) - 2;
      const endCount = Math.ceil((scrollSize - padding[0] + dSize) / dItemSize) + 2;

      let count = 0;
      let skipCount = 0;
      let renderCount = 0;
      const loop = (arr: T[]) => {
        const list: React.ReactNode[] = [];
        for (let index = 0; index < arr.length; index++) {
          count += 1;
          if (count > endCount) {
            return list;
          }
          const shouldRender = count > startCount;
          if (dNestedKey && isArray(arr[index][dNestedKey])) {
            const children = loop(arr[index][dNestedKey]);
            if (shouldRender || children.length > 0) {
              renderCount += 1;
              list.push(dItemRender(arr[index], index, { children }));
            } else {
              skipCount += 1;
            }
          } else {
            if (shouldRender) {
              renderCount += 1;
              list.push(
                dItemRender(arr[index], index, {
                  'aria-setsize': arr.length,
                  'aria-posinset': index + 1,
                })
              );
            } else {
              skipCount += 1;
            }
          }
        }
        return list;
      };

      setList(loop(dList));

      setFillSize([
        { [dScrollY ? 'height' : 'width']: dItemSize * skipCount },
        { [dScrollY ? 'height' : 'width']: dItemSize * (allLength - skipCount - renderCount) },
      ]);
    }
  }, [dItemRender, dItemSize, dList, dNestedKey, dScrollY, dSize, listEl, setFillSize, setList]);

  const handleScroll = useCallback(
    (e) => {
      onScroll?.(e);

      if (listEl) {
        if (
          (dScrollY && listEl.scrollTop + listEl.clientHeight === listEl.scrollHeight) ||
          (!dScrollY && listEl.scrollLeft + listEl.clientWidth === listEl.scrollWidth)
        ) {
          onScrollEnd?.();
        }
      }

      flushSync(() => updateList());
    },
    [dScrollY, listEl, onScroll, onScrollEnd, updateList]
  );

  useLayoutEffect(() => {
    if (!dataRef.current.isFirst) {
      if (!dStopUpdate) {
        updateList();
      }
    }
  }, [dStopUpdate, updateList]);

  useLayoutEffect(() => {
    if (dataRef.current.isFirst) {
      updateList();
    }
  }, [updateList]);

  return (
    <ul {...restProps} ref={listRef} onScroll={handleScroll}>
      <div
        style={{
          ...fillSize[0],
          display: dScrollY ? undefined : 'inline-block',
        }}
        aria-hidden={true}
      ></div>
      {list}
      <div
        style={{
          ...fillSize[1],
          display: dScrollY ? undefined : 'inline-block',
        }}
        aria-hidden={true}
      ></div>
    </ul>
  );
}
