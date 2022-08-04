import type { DId } from '../../utils/global';

import { isBoolean, isNumber, isUndefined, nth } from 'lodash';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { useAsync, useComponentConfig, useEventCallback, useIsomorphicLayoutEffect } from '../../hooks';
import { registerComponentMate, toPx } from '../../utils';

export interface DVirtualScrollRef<T> {
  scrollToItem: (item: T) => void;
  scrollByStep: (step: number) => T | undefined;
  scrollToStart: () => T | undefined;
  scrollToEnd: () => T | undefined;
}

export interface DItemRenderProps {
  iARIA: {
    'aria-level': number;
    'aria-setsize': number;
    'aria-posinset': number;
  };
  iChildren?: React.ReactNode[];
}

export interface DVirtualScrollProps<T> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dList: T[];
  dExpands?: Set<DId>;
  dItemRender: (item: T, index: number, props: DItemRenderProps, parent: T[]) => React.ReactNode;
  dItemSize: number | ((item: T) => number);
  dItemNested?: (item: T) => T[] | undefined;
  dItemKey: (item: T) => DId;
  dFocusable?: boolean | ((item: T) => boolean);
  dFocusItem?: T;
  dSizeIncludeNestedItem?: boolean;
  dSize?: number;
  dPadding?: number;
  dHorizontal?: boolean;
  dEmpty?: React.ReactNode;
  onScrollEnd?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DVirtualScroll' });
function VirtualScroll<T>(props: DVirtualScrollProps<T>, ref: React.ForwardedRef<DVirtualScrollRef<T>>): JSX.Element | null {
  const {
    dList,
    dExpands,
    dItemRender,
    dItemSize,
    dItemNested,
    dItemKey,
    dFocusable = true,
    dFocusItem,
    dSizeIncludeNestedItem = false,
    dSize,
    dPadding,
    dHorizontal = false,
    dEmpty,
    onScrollEnd,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Ref
  const listRef = useRef<HTMLUListElement>(null);
  //#endregion

  const dataRef = useRef<{
    listCache: Map<DId, React.ReactNode[]>;
  }>({ listCache: new Map() });

  const asyncCapture = useAsync();

  const [scrollPosition, setScrollPosition] = useState(0);
  const getItemSize = (item: T) => (isNumber(dItemSize) ? dItemSize : dItemSize(item));
  const getFocusable = (item: T) => (isBoolean(dFocusable) ? dFocusable : dFocusable(item));

  const [elSize, setElSize] = useState<number>();
  const [elPaddingSize, setElPaddingSize] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsomorphicLayoutEffect(() => {
    if (isUndefined(dSize) && listRef.current) {
      setElSize(listRef.current[dHorizontal ? 'clientWidth' : 'clientHeight']);
    }
    if (isUndefined(dPadding) && listRef.current) {
      setElPaddingSize(toPx(getComputedStyle(listRef.current).getPropertyValue(dHorizontal ? 'padding-left' : 'padding-top'), true));
    }
  });
  useEffect(() => {
    if (isUndefined(dSize)) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      const el = listRef.current;
      if (el) {
        asyncGroup.onResize(el, () => {
          setElSize(el[dHorizontal ? 'clientWidth' : 'clientHeight']);
        });
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dHorizontal, dSize]);

  const paddingSize = dPadding ?? elPaddingSize;

  const list = (() => {
    const ulSize = dSize ?? elSize;
    if (isUndefined(ulSize)) {
      return [];
    }

    let totalSize = 0;
    const nestedSize = new Map<DId, number>();
    const getScrollSize = (arr: T[]) => {
      let size = 0;
      arr.forEach((item) => {
        size += getItemSize(item);
        const children = dItemNested?.(item);
        if (children) {
          const childrenSize = isUndefined(dExpands) || dExpands.has(dItemKey(item)) ? getScrollSize(children) : 0;
          size += childrenSize;
          nestedSize.set(dItemKey(item), childrenSize);
        }
      });
      return size;
    };
    totalSize = getScrollSize(dList);
    const maxScrollSize = Math.max(totalSize + paddingSize * 2 - ulSize, 0);
    const _scrollPosition = Math.min(scrollPosition, maxScrollSize);

    let totalAccSize = 0;
    const startSize = _scrollPosition - ulSize - paddingSize;
    const endSize = _scrollPosition + ulSize + ulSize - paddingSize;

    let hasStart = false;
    let hasEnd = false;
    const getList = (arr: T[], parent: T[] = []): React.ReactNode[] => {
      const fillSize = [0, 0];
      const list: React.ReactNode[] = [];
      let skipNestedSize = 0;
      if (!dSizeIncludeNestedItem) {
        skipNestedSize = arr.filter((item) => dItemNested?.(item)).length;
      }

      for (const [index, item] of arr.entries()) {
        const key = dItemKey(item);
        const size = getItemSize(item);
        const children = dItemNested?.(item);
        const childrenSize = nestedSize.get(key) ?? 0;

        if (hasEnd) {
          fillSize[1] += size + childrenSize;
          continue;
        }

        totalAccSize += size;
        if (children) {
          if (totalAccSize + childrenSize > startSize) {
            let childrenList: React.ReactNode[] = [];
            if (isUndefined(dExpands)) {
              childrenList = getList(children, parent.concat([item]));
            } else {
              childrenList = dataRef.current.listCache.get(key) ?? [];
              if (dExpands.has(dItemKey(item))) {
                childrenList = getList(children, parent.concat([item]));
                dataRef.current.listCache.set(key, childrenList);
              }
            }

            const renderProps = {
              iARIA: { 'aria-level': parent.length + 1, 'aria-setsize': arr.length - skipNestedSize, 'aria-posinset': index + 1 },
              iChildren: childrenList,
            };

            list.push(dItemRender(item, index, renderProps, parent));
          } else {
            totalAccSize += childrenSize;
            fillSize[0] += size + childrenSize;
          }
        } else if (!hasStart) {
          if (totalAccSize > startSize) {
            list.push(
              dItemRender(
                item,
                index,
                {
                  iARIA: { 'aria-level': parent.length + 1, 'aria-setsize': arr.length - skipNestedSize, 'aria-posinset': index + 1 },
                },
                parent
              )
            );
            hasStart = true;
          } else {
            fillSize[0] += size;
          }
        } else if (!hasEnd) {
          if (totalAccSize > endSize) {
            hasEnd = true;
            fillSize[1] += size;
          } else {
            list.push(
              dItemRender(
                item,
                index,
                {
                  iARIA: { 'aria-level': parent.length + 1, 'aria-setsize': arr.length - skipNestedSize, 'aria-posinset': index + 1 },
                },
                parent
              )
            );
          }
        }
      }

      list.unshift(
        <div
          key="$$fill-size-0"
          style={{ display: dHorizontal ? 'inline-block' : undefined, [dHorizontal ? 'width' : 'height']: fillSize[0] }}
          aria-hidden
        ></div>
      );
      list.push(
        <div
          key="$$fill-size-1"
          style={{ display: dHorizontal ? 'inline-block' : undefined, [dHorizontal ? 'width' : 'height']: fillSize[1] }}
          aria-hidden
        ></div>
      );

      return list;
    };

    return getList(dList);
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
        if (dItemKey(_item) === dItemKey(item) || !isUndefined(findItem)) {
          findItem = _item;
          break;
        }

        accSize += getItemSize(_item);

        const children = dItemNested?.(_item);
        if (children && (isUndefined(dExpands) || dExpands.has(dItemKey(_item)))) {
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
          if (dItemKey(item) === dItemKey(dFocusItem)) {
            findIndex = index;
          }

          accSize += getItemSize(item);
          accSizeList.push({ item, accSize });

          const children = dItemNested?.(item);
          if (children && (isUndefined(dExpands) || dExpands.has(dItemKey(item)))) {
            reduceArr(children);
          }
        }
      };
      reduceArr(dList);

      if (findIndex !== -1) {
        if (step < 0) {
          for (let index = findIndex - 1, n = 0; n < accSizeList.length; index--, n++) {
            const accSize = nth(accSizeList, index);
            if (accSize && getFocusable(accSize.item)) {
              findItem = accSize.item;
              offsetSize = [accSize.accSize - getItemSize(findItem) + paddingSize, accSize.accSize + paddingSize];
              break;
            }
          }
        } else {
          for (let index = findIndex + 1, n = 0; n < accSizeList.length; index++, n++) {
            const accSize = nth(accSizeList, index % accSizeList.length);
            if (accSize && getFocusable(accSize.item)) {
              findItem = accSize.item;
              offsetSize = [accSize.accSize - getItemSize(findItem) + paddingSize, accSize.accSize + paddingSize];
              break;
            }
          }
        }
      }

      if (!isUndefined(offsetSize)) {
        const listElScrollPosition = listRef.current[dHorizontal ? 'scrollLeft' : 'scrollTop'];
        const listElClientSize = listRef.current[dHorizontal ? 'clientWidth' : 'clientHeight'];
        if (listElScrollPosition > offsetSize[1]) {
          scrollTo(offsetSize[0] - paddingSize);
        } else if (offsetSize[0] > listElScrollPosition + listElClientSize) {
          scrollTo(offsetSize[1] - listElClientSize + paddingSize);
        } else {
          if (step > 0) {
            if (offsetSize[1] > listElScrollPosition + listElClientSize) {
              scrollTo(offsetSize[1] - listElClientSize + paddingSize);
            }
          } else {
            if (listElScrollPosition > offsetSize[0]) {
              scrollTo(offsetSize[0] - paddingSize);
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
        if (getFocusable(item) || !isUndefined(findItem)) {
          findItem = item;
          break;
        }

        const children = dItemNested?.(item);
        if (children && (isUndefined(dExpands) || dExpands.has(dItemKey(item)))) {
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
        if (getFocusable(item) || !isUndefined(findItem)) {
          findItem = item;
          break;
        }

        const children = dItemNested?.(item);
        if (children && (isUndefined(dExpands) || dExpands.has(dItemKey(item)))) {
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

  return (
    <ul
      {...restProps}
      ref={listRef}
      onScroll={(e) => {
        restProps.onScroll?.(e);

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
      }}
    >
      {dList.length === 0 ? dEmpty : list}
    </ul>
  );
}

export const DVirtualScroll: <T>(
  props: DVirtualScrollProps<T> & { ref?: React.ForwardedRef<DVirtualScrollRef<T>> }
) => ReturnType<typeof VirtualScroll> = React.forwardRef(VirtualScroll) as any;
