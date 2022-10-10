import type { DCloneHTMLElement, DId } from '../../utils/types';

import { isBoolean, isNumber, isUndefined, nth } from 'lodash';
import React, { useImperativeHandle, useMemo, useRef, useState } from 'react';

import { useEventCallback, useForkRef, useIsomorphicLayoutEffect, useRefExtra, useResize } from '@react-devui/hooks';
import { toPx } from '@react-devui/utils';

import { cloneHTMLElement, registerComponentMate } from '../../utils';
import { useComponentConfig } from '../root';

const EMPTY = Symbol();

export type DVirtualScrollPerformance<T> = Pick<
  DVirtualScrollProps<T>,
  'dList' | 'dExpands' | 'dItemSize' | 'dItemNested' | 'dItemKey' | 'dFocusable'
>;

export interface DVirtualScrollRef<T> {
  scrollToItem: (item: T) => void;
  scrollByStep: (step: number) => T | undefined;
  scrollToStart: () => T | undefined;
  scrollToEnd: () => T | undefined;
}

export interface DItemRenderProps {
  aria: {
    'aria-level': number;
    'aria-setsize': number;
    'aria-posinset': number;
  };
  vsList?: React.ReactNode;
}

export interface DVirtualScrollProps<T> {
  children: (props: { render: DCloneHTMLElement; vsList: React.ReactNode }) => JSX.Element | null;
  dRef?: { list?: React.ForwardedRef<any> };
  dList: T[];
  dFillNode: React.ReactElement;
  dItemRender: (item: T, index: number, props: DItemRenderProps, parent: T[]) => React.ReactNode;
  dItemSize: number | ((item: T) => number);
  dItemNested?: (item: T) => { list?: T[]; emptySize?: number; inAriaSetsize: boolean } | undefined;
  dItemKey: (item: T) => DId;
  dFocusable?: boolean | ((item: T) => boolean);
  dFocusItem?: T;
  dSize?: number;
  dPadding?: number;
  dHorizontal?: boolean;
  dEmptyRender?: (item: T) => React.ReactNode;
  dExpands?: Set<DId>;
  onScrollEnd?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DVirtualScroll' as const });
function VirtualScroll<T>(props: DVirtualScrollProps<T>, ref: React.ForwardedRef<DVirtualScrollRef<T>>): JSX.Element | null {
  const {
    children,
    dRef,
    dList,
    dFillNode,
    dItemRender,
    dItemSize,
    dItemNested,
    dItemKey,
    dFocusable = true,
    dFocusItem,
    dSize,
    dPadding,
    dHorizontal = false,
    dEmptyRender,
    dExpands,
    onScrollEnd,
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Ref
  const listRef = useRefExtra(undefined, true);
  const combineListlRef = useForkRef(listRef, dRef?.list);
  //#endregion

  const dataRef = useRef<{
    listCache: Map<DId, React.ReactNode[]>;
  }>({
    listCache: new Map(),
  });

  const [scrollPosition, setScrollPosition] = useState(0);
  const getItemSize = useMemo(() => (isNumber(dItemSize) ? () => dItemSize : dItemSize), [dItemSize]);
  const checkFocusable = useMemo(() => (isBoolean(dFocusable) ? () => dFocusable : dFocusable), [dFocusable]);

  const [itemsMap, totalSize, firstFocusableItem, lastFocusableItem] = useMemo(() => {
    let accSize = 0;
    let firstFocusableItem: T | undefined;
    let lastFocusableItem: T | undefined;

    const items = new Map<DId, { item: T; accSize: number; nestedSize: number }>();
    const reduceArr = (arr: T[]) => {
      let size = 0;
      for (const item of arr) {
        if (checkFocusable(item)) {
          lastFocusableItem = item;
          if (isUndefined(firstFocusableItem)) {
            firstFocusableItem = item;
          }
        }

        size += getItemSize(item);
        accSize += getItemSize(item);

        const data = { item, accSize, nestedSize: 0 };
        items.set(dItemKey(item), data);

        const nestedData = dItemNested?.(item);
        if (nestedData && nestedData.list && (isUndefined(dExpands) || dExpands.has(dItemKey(item)))) {
          if (nestedData.list.length === 0) {
            data.nestedSize = nestedData.emptySize ?? 0;
            size += data.nestedSize;
            accSize += data.nestedSize;
          } else {
            data.nestedSize = reduceArr(nestedData.list);
            size += data.nestedSize;
          }
        }
      }
      return size;
    };
    return [items, reduceArr(dList), firstFocusableItem, lastFocusableItem];
  }, [checkFocusable, dExpands, dItemKey, dItemNested, dList, getItemSize]);

  const [elSize, setElSize] = useState<number>();
  const [elPaddingSize, setElPaddingSize] = useState<number>();
  const getSize = () => {
    if (listRef.current) {
      if (isUndefined(dSize)) {
        setElSize(listRef.current[dHorizontal ? 'clientWidth' : 'clientHeight']);
      }

      if (isUndefined(dPadding)) {
        setElPaddingSize(toPx(getComputedStyle(listRef.current).getPropertyValue(dHorizontal ? 'padding-left' : 'padding-top'), true));
      }
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsomorphicLayoutEffect(() => {
    getSize();
  });
  useResize(listRef, getSize);

  const ulSize = dSize ?? elSize;
  const paddingSize = dPadding ?? elPaddingSize;

  const list = (() => {
    if (isUndefined(ulSize) || isUndefined(paddingSize)) {
      return [];
    }

    const maxScrollSize = Math.max(totalSize + paddingSize * 2 - ulSize, 0);
    const _scrollPosition = Math.min(scrollPosition, maxScrollSize);

    let totalAccSize = 0;
    const startSize = _scrollPosition - ulSize - paddingSize;
    const endSize = _scrollPosition + ulSize + ulSize - paddingSize;

    let hasStart = false;
    let hasEnd = false;
    const getList = (arr: (T | typeof EMPTY)[], parent: T[] = []): React.ReactNode[] => {
      const fillSize = [0, 0];
      const list: React.ReactNode[] = [];
      const setsize = arr.filter((item) => item !== EMPTY && (dItemNested?.(item)?.inAriaSetsize ?? true)).length;

      for (const [index, item] of arr.entries()) {
        let key: DId = '';
        let size = 0;
        let nestedList: T[] | undefined;
        let childrenSize = 0;
        let emptyNode: React.ReactNode;
        if (item === EMPTY) {
          size = dItemNested?.(parent[parent.length - 1])?.emptySize ?? 0;
          emptyNode = <React.Fragment key="$$empty">{dEmptyRender?.(parent[parent.length - 1])}</React.Fragment>;
        } else {
          key = dItemKey(item);
          size = getItemSize(item);
          nestedList = dItemNested?.(item)?.list;
          if (nestedList) {
            childrenSize = itemsMap.get(key)!.nestedSize;
          }
        }

        if (hasEnd) {
          fillSize[1] += size + childrenSize;
          continue;
        }

        totalAccSize += size;
        if (nestedList) {
          if (totalAccSize + childrenSize > startSize) {
            let childrenList: React.ReactNode[] = [];
            if (isUndefined(dExpands)) {
              childrenList = getList(nestedList.length === 0 ? [EMPTY] : nestedList, parent.concat([item as T]));
            } else {
              childrenList = dataRef.current.listCache.get(key) ?? [];
              if (dExpands.has(dItemKey(item as T))) {
                childrenList = getList(nestedList.length === 0 ? [EMPTY] : nestedList, parent.concat([item as T]));
                dataRef.current.listCache.set(key, childrenList);
              }
            }

            list.push(
              dItemRender(
                item as T,
                index,
                {
                  aria: { 'aria-level': parent.length + 1, 'aria-setsize': setsize, 'aria-posinset': index + 1 },
                  vsList: childrenList,
                },
                parent
              )
            );
          } else {
            totalAccSize += childrenSize;
            fillSize[0] += size + childrenSize;
          }
        } else if (!hasStart) {
          if (totalAccSize > startSize) {
            list.push(
              item === EMPTY
                ? emptyNode
                : dItemRender(
                    item,
                    index,
                    {
                      aria: { 'aria-level': parent.length + 1, 'aria-setsize': setsize, 'aria-posinset': index + 1 },
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
              item === EMPTY
                ? emptyNode
                : dItemRender(
                    item,
                    index,
                    {
                      aria: { 'aria-level': parent.length + 1, 'aria-setsize': setsize, 'aria-posinset': index + 1 },
                    },
                    parent
                  )
            );
          }
        }
      }

      if (fillSize[0] > 0) {
        list.unshift(
          React.cloneElement(dFillNode, {
            key: '$$fill-size-0',
            style: {
              ...dFillNode.props.style,
              overflow: 'hidden',
              [dHorizontal ? 'height' : 'width']: 0,
              [dHorizontal ? 'width' : 'height']: fillSize[0],
              flexShrink: 0,
            },
            'aria-hidden': true,
          })
        );
      }
      if (fillSize[1] > 0) {
        list.push(
          React.cloneElement(dFillNode, {
            key: '$$fill-size-1',
            style: {
              ...dFillNode.props.style,
              overflow: 'hidden',
              [dHorizontal ? 'height' : 'width']: 0,
              [dHorizontal ? 'width' : 'height']: fillSize[1],
            },
            'aria-hidden': true,
          })
        );
      }

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
    if (!isUndefined(paddingSize)) {
      const findItem = itemsMap.get(dItemKey(item));

      if (!isUndefined(findItem)) {
        scrollTo(findItem.accSize - getItemSize(findItem.item) + paddingSize);
      }
    }
  });

  const scrollToStart = useEventCallback(() => {
    scrollTo(0);

    return firstFocusableItem;
  });

  const scrollToEnd = useEventCallback(() => {
    if (listRef.current) {
      scrollTo(listRef.current[dHorizontal ? 'scrollWidth' : 'scrollHeight']);
    }

    return lastFocusableItem;
  });

  const scrollByStep = useEventCallback((step: number) => {
    if (!isUndefined(paddingSize)) {
      if (isUndefined(dFocusItem)) {
        return step > 0 ? scrollToStart() : scrollToEnd();
      }

      let findItem: T | undefined;
      let offsetSize: [number, number] | undefined;

      if (listRef.current) {
        let index = -1;
        let findIndex = -1;
        const accSizeList = [];
        for (const iterator of itemsMap) {
          index += 1;
          if (dItemKey(iterator[1].item) === dItemKey(dFocusItem)) {
            findIndex = index;
          }
          accSizeList.push(iterator[1]);
        }

        if (findIndex !== -1) {
          if (step < 0) {
            for (let index = findIndex - 1, n = 0; n < accSizeList.length; index--, n++) {
              const accSizeItem = nth(accSizeList, index);
              if (accSizeItem && checkFocusable(accSizeItem.item)) {
                findItem = accSizeItem.item;
                offsetSize = [accSizeItem.accSize - getItemSize(findItem) + paddingSize, accSizeItem.accSize + paddingSize];
                break;
              }
            }
          } else {
            for (let index = findIndex + 1, n = 0; n < accSizeList.length; index++, n++) {
              const accSizeItem = nth(accSizeList, index % accSizeList.length);
              if (accSizeItem && checkFocusable(accSizeItem.item)) {
                findItem = accSizeItem.item;
                offsetSize = [accSizeItem.accSize - getItemSize(findItem) + paddingSize, accSizeItem.accSize + paddingSize];
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
    }
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

  return children({
    render: (el) =>
      cloneHTMLElement(el, {
        ref: combineListlRef,
        onScroll: (e) => {
          el.props.onScroll?.(e);

          setScrollPosition(e.currentTarget[dHorizontal ? 'scrollLeft' : 'scrollTop']);

          if (
            dHorizontal
              ? e.currentTarget.scrollLeft + e.currentTarget.clientWidth === e.currentTarget.scrollWidth
              : e.currentTarget.scrollTop + e.currentTarget.clientHeight === e.currentTarget.scrollHeight
          ) {
            onScrollEnd?.();
          }
        },
      }),
    vsList: list,
  });
}

export const DVirtualScroll: <T>(
  props: DVirtualScrollProps<T> & React.RefAttributes<DVirtualScrollRef<T>>
) => ReturnType<typeof VirtualScroll> = React.forwardRef(VirtualScroll) as any;
