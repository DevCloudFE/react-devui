import { isUndefined, nth } from 'lodash';
import React, { useImperativeHandle, useRef } from 'react';
import { useState } from 'react';

import { useEventCallback } from '../../hooks';

export interface DVirtualScrollRef<T> {
  scrollToItem: (item: T) => void;
  scrollByStep: (step: number) => T | undefined;
  scrollToStart: () => T | undefined;
  scrollToEnd: () => T | undefined;
}

export interface DItemRenderProps {
  'aria-setsize': number;
  'aria-posinset': number;
  children?: React.ReactNode[];
}

export interface DVirtualScrollProps<T> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dList: T[];
  dItemRender: (item: T, index: number, props: DItemRenderProps, parent: T[]) => React.ReactNode;
  dGetSize: (item: T) => number;
  dGetChildren?: (item: T) => T[] | undefined;
  dCompareItem: (a: T, b: T) => boolean;
  dCanFocus: (item: T) => boolean;
  dFocusItem?: T;
  dSize: number;
  dPadding?: number;
  dHorizontal?: boolean;
  dEmpty?: React.ReactNode;
  onScrollEnd?: () => void;
}

function VirtualScroll<T>(props: DVirtualScrollProps<T>, ref: React.ForwardedRef<DVirtualScrollRef<T>>) {
  const {
    dList,
    dItemRender,
    dGetSize,
    dGetChildren,
    dCompareItem,
    dCanFocus,
    dFocusItem,
    dSize,
    dPadding = 0,
    dHorizontal = false,
    dEmpty,
    onScrollEnd,

    onScroll,
    ...restProps
  } = props;

  //#region Ref
  const listRef = useRef<HTMLUListElement>(null);
  //#endregion

  const [scrollPosition, setScrollPosition] = useState(0);

  const [list, fillSize] = (() => {
    let listSize = 0;
    const getScrollSize = (arr: T[]) => {
      arr.forEach((item) => {
        listSize += dGetSize(item);
        const children = dGetChildren?.(item);
        if (children) {
          getScrollSize(children);
        }
      });
    };
    getScrollSize(dList);
    const maxScrollSize = Math.max(listSize + dPadding * 2 - dSize, 0);
    const _scrollPosition = Math.min(scrollPosition, maxScrollSize);

    let accSize = 0;
    let renderSize = 0;
    let fillBack = 0;
    const startSize = _scrollPosition - 200 - dPadding;
    const endSize = _scrollPosition + dSize + 200 - dPadding;

    let hasStart = false;
    let hasEnd = false;
    const getList = (arr: T[], parent: T[] = []): React.ReactNode[] => {
      const list: React.ReactNode[] = [];

      for (const [index, item] of arr.entries()) {
        if (hasEnd) {
          break;
        }

        const size = dGetSize(item);
        accSize += size;

        const children = dGetChildren?.(item);
        if (children) {
          renderSize += size;
          list.push(
            dItemRender(
              item,
              index,
              {
                'aria-setsize': arr.length,
                'aria-posinset': index + 1,
                children: getList(children, parent.concat([item])),
              },
              parent
            )
          );
        } else if (!hasStart) {
          if (accSize > startSize) {
            renderSize += size;
            list.push(
              dItemRender(
                item,
                index,
                {
                  'aria-setsize': arr.length,
                  'aria-posinset': index + 1,
                },
                parent
              )
            );
            hasStart = true;
          }
        } else if (!hasEnd) {
          if (accSize > endSize) {
            hasEnd = true;
            fillBack = listSize - accSize + size;
          } else {
            renderSize += size;
            list.push(
              dItemRender(
                item,
                index,
                {
                  'aria-setsize': arr.length,
                  'aria-posinset': index + 1,
                },
                parent
              )
            );
          }
        }
      }

      return list;
    };

    return [getList(dList), [listSize - fillBack - renderSize, fillBack]];
  })();

  const scrollTo = (num: number) => {
    if (listRef.current) {
      listRef.current[dHorizontal ? 'scrollLeft' : 'scrollTop'] = num;
    }
  };

  const scrollToItem = useEventCallback((item: T) => {
    let accSize = 0;
    let findItem: T | undefined;
    const reduceArr = (arr: T[]) => {
      for (const _item of arr) {
        if (dCompareItem(_item, item) || !isUndefined(findItem)) {
          findItem = _item;
          break;
        }

        accSize += dGetSize(_item);

        const children = dGetChildren?.(_item);
        if (children) {
          reduceArr(children);
        }
      }
    };
    reduceArr(dList);

    if (!isUndefined(findItem)) {
      scrollTo(accSize);
    }

    return findItem;
  });

  const scrollByStep = useEventCallback((step: number) => {
    let findItem: T | undefined;
    let offsetSize: [number, number] | undefined;

    if (listRef.current && !isUndefined(dFocusItem)) {
      const accSizeList: { item: T; accSize: number }[] = [];
      let accSize = 0;
      let index = -1;
      let findIndex = -1;
      const reduceArr = (arr: T[]) => {
        for (const item of arr) {
          index += 1;
          if (dCompareItem(item, dFocusItem)) {
            findIndex = index;
          }

          accSize += dGetSize(item);
          accSizeList.push({ item, accSize });

          const children = dGetChildren?.(item);
          if (children) {
            reduceArr(children);
          }
        }
      };
      reduceArr(dList);

      if (findIndex !== -1) {
        if (step < 0) {
          for (let index = findIndex - 1, n = 0; n < accSizeList.length; index--, n++) {
            const accSize = nth(accSizeList, index);
            if (accSize && dCanFocus(accSize.item)) {
              findItem = accSize.item;
              offsetSize = [accSize.accSize - dGetSize(findItem) + dPadding, accSize.accSize + dPadding];
              break;
            }
          }
        } else {
          for (let index = findIndex + 1, n = 0; n < accSizeList.length; index++, n++) {
            const accSize = nth(accSizeList, index % accSizeList.length);
            if (accSize && dCanFocus(accSize.item)) {
              findItem = accSize.item;
              offsetSize = [accSize.accSize - dGetSize(findItem) + dPadding, accSize.accSize + dPadding];
              break;
            }
          }
        }
      }

      if (!isUndefined(offsetSize)) {
        const listElScrollPosition = listRef.current[dHorizontal ? 'scrollLeft' : 'scrollTop'];
        const listElClientSize = listRef.current[dHorizontal ? 'clientWidth' : 'clientHeight'];
        if (listElScrollPosition > offsetSize[1]) {
          scrollTo(offsetSize[0] - dPadding);
        } else if (offsetSize[0] > listElScrollPosition + listElClientSize) {
          scrollTo(offsetSize[1] - listElClientSize + dPadding);
        } else {
          if (step > 0) {
            if (offsetSize[1] > listElScrollPosition + listElClientSize) {
              scrollTo(offsetSize[1] - listElClientSize + dPadding);
            }
          } else {
            if (listElScrollPosition > offsetSize[0]) {
              scrollTo(offsetSize[0] - dPadding);
            }
          }
        }
      }
    }

    return findItem;
  });

  const scrollToStart = useEventCallback(() => {
    let findItem: T | undefined;
    const reduceArr = (arr: T[]) => {
      for (const item of arr) {
        if (dCanFocus(item) || !isUndefined(findItem)) {
          findItem = item;
          break;
        }

        const children = dGetChildren?.(item);
        if (children) {
          reduceArr(children);
        }
      }
    };
    reduceArr(dList);

    scrollTo(0);

    return findItem;
  });

  const scrollToEnd = useEventCallback(() => {
    let findItem: T | undefined;
    const reduceArr = (arr: T[]) => {
      for (let index = arr.length - 1; index >= 0; index--) {
        const item = arr[index];
        if (dCanFocus(item) || !isUndefined(findItem)) {
          findItem = item;
          break;
        }

        const children = dGetChildren?.(item);
        if (children) {
          reduceArr(children);
        }
      }
    };
    reduceArr(dList);

    if (listRef.current) {
      scrollTo(listRef.current[dHorizontal ? 'scrollWidth' : 'scrollHeight']);
    }

    return findItem;
  });

  useImperativeHandle(
    ref,
    () => ({
      scrollToItem,
      scrollByStep,
      scrollToStart,
      scrollToEnd,
    }),
    [scrollByStep, scrollToEnd, scrollToStart, scrollToItem]
  );

  const handleScroll: React.UIEventHandler<HTMLUListElement> = (e) => {
    onScroll?.(e);

    if (listRef.current) {
      setScrollPosition(listRef.current[dHorizontal ? 'scrollLeft' : 'scrollTop']);

      if (
        dHorizontal
          ? listRef.current.scrollLeft + listRef.current.clientWidth === listRef.current.scrollWidth
          : listRef.current.scrollTop + listRef.current.clientHeight === listRef.current.scrollHeight
      ) {
        onScrollEnd?.();
      }
    }
  };

  return (
    <ul {...restProps} ref={listRef} onScroll={handleScroll}>
      {dList.length === 0 ? (
        dEmpty
      ) : (
        <>
          <div style={{ [dHorizontal ? 'width' : 'height']: fillSize[0] }} aria-hidden={true}></div>
          {list}
          <div style={{ [dHorizontal ? 'width' : 'height']: fillSize[1] }} aria-hidden={true}></div>
        </>
      )}
    </ul>
  );
}

export const DVirtualScroll: <T>(
  props: DVirtualScrollProps<T> & { ref?: React.ForwardedRef<DVirtualScrollRef<T>> }
) => ReturnType<typeof VirtualScroll> = React.forwardRef(VirtualScroll) as any;
