import type { Updater } from '../../hooks/two-way-binding';

import { isArray } from 'lodash';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useAsync, useImmer, useTwoWayBinding } from '../../hooks';

export interface DItemRenderProps {
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  children?: React.ReactNode;
}

const NESTED_KEY = 'dChildren';

export interface DVirtualScrollProps<T> extends React.HTMLAttributes<HTMLElement> {
  dFocusOption: [T | null, Updater<T | null>?];
  dHasInitFocus?: boolean;
  dRendered?: boolean;
  dListRef?: (node: HTMLUListElement | null) => void;
  dScrollY?: boolean;
  dSize: number;
  dItemSize: number;
  dPaddingSize?: number;
  dList: T[];
  dCanSelectOption: (option: T) => boolean;
  dCompareOption: (a: T, b: T) => boolean;
  dItemRender: (item: T, index: number, props: DItemRenderProps) => React.ReactNode;
  dEmpty?: React.ReactNode;
  onScrollEnd?: () => void;
  onFocusChange?: (option: T | null) => void;
}

export function DVirtualScroll<T>(props: DVirtualScrollProps<T>) {
  const {
    dFocusOption,
    dHasInitFocus = false,
    dRendered = true,
    dListRef,
    dScrollY = true,
    dSize,
    dItemSize,
    dPaddingSize = 0,
    dList,
    dCanSelectOption,
    dCompareOption,
    dItemRender,
    dEmpty,
    onScrollEnd,
    onFocusChange,
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
    hasInitFocus: boolean;
  }>({
    isFirst: true,
    hasInitFocus: dHasInitFocus,
  });

  const asyncCapture = useAsync();

  const [focusOption, changeFocusOption] = useTwoWayBinding(null, dFocusOption, onFocusChange);

  const [list, setList] = useImmer<React.ReactNode[]>([]);
  const [fillSize, setFillSize] = useImmer<[React.CSSProperties, React.CSSProperties]>([{}, {}]);

  const [flatOptions, focusIndex] = useMemo(() => {
    const flatOptions: Array<T | undefined> = [];
    let focusIndex = -1;
    let hasFind = false;
    const reduceList = (arr: T[]) => {
      if (arr.length === 0) {
        if (dEmpty) {
          flatOptions.push(undefined);

          if (!hasFind) {
            focusIndex += 1;
          }
        }
      } else {
        arr.forEach((item) => {
          flatOptions.push(item);

          if (!hasFind) {
            focusIndex += 1;
          }
          if (focusOption && dCompareOption(focusOption, item)) {
            hasFind = true;
          }

          if (isArray(item[NESTED_KEY])) {
            reduceList(item[NESTED_KEY] as T[]);
          }
        });
      }
    };
    reduceList(dList);

    return [flatOptions, hasFind ? focusIndex : -1];
  }, [dCompareOption, dEmpty, dList, focusOption]);

  const updateList = useCallback(() => {
    if (listEl) {
      dataRef.current.isFirst = false;

      const maxScrollSize = dItemSize * flatOptions.length + dPaddingSize * 2 - dSize;
      const scrollSize = Math.min(maxScrollSize, dScrollY ? listEl.scrollTop : listEl.scrollLeft);

      const startCount = Math.floor((scrollSize - dPaddingSize) / dItemSize) - 2;
      const endCount = Math.ceil((scrollSize - dPaddingSize + dSize) / dItemSize) + 2;

      let count = 0;
      let skipCount = 0;
      let renderCount = 0;
      const loop = (arr: T[]) => {
        const list: React.ReactNode[] = [];
        if (arr.length === 0) {
          if (dEmpty) {
            count += 1;
            if (count > endCount) {
              return list;
            }
            const shouldRender = count > startCount;
            if (shouldRender) {
              renderCount += 1;
              list.push(dEmpty);
            } else {
              skipCount += 1;
            }
          }
        } else {
          for (let index = 0; index < arr.length; index++) {
            count += 1;
            if (count > endCount) {
              return list;
            }
            const shouldRender = count > startCount;
            if (isArray(arr[index][NESTED_KEY])) {
              const children = loop(arr[index][NESTED_KEY] as T[]);
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
        }
        return list;
      };

      setList(loop(dList));

      setFillSize([
        { [dScrollY ? 'height' : 'width']: dItemSize * skipCount },
        { [dScrollY ? 'height' : 'width']: dItemSize * (flatOptions.length - skipCount - renderCount) },
      ]);
    }
  }, [dEmpty, dItemRender, dItemSize, dList, dPaddingSize, dScrollY, dSize, flatOptions.length, listEl, setFillSize, setList]);

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
      if (dRendered) {
        if (dataRef.current.hasInitFocus && listEl) {
          dataRef.current.hasInitFocus = false;
          listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = focusIndex * dItemSize;
        } else {
          updateList();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dRendered, updateList]);

  useLayoutEffect(() => {
    if (dataRef.current.isFirst) {
      updateList();
    }
  }, [updateList]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (listEl && dRendered && focusIndex !== -1) {
      const changeFocusByKeydown = (next = true) => {
        let index = focusIndex;
        let option: T | undefined;
        const getOption = () => {
          if (!next && index === 0) {
            listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = 0;
            return;
          }
          if (next && index === flatOptions.length - 1) {
            listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = listEl[dScrollY ? 'scrollHeight' : 'scrollWidth'];
            return;
          }
          index = next ? index + 1 : index - 1;
          let _option: T | undefined = flatOptions[index];
          _option = _option && dCanSelectOption(_option) ? _option : undefined;
          if (_option) {
            option = _option;
          } else {
            getOption();
          }
        };
        getOption();
        if (option) {
          const elOffset = [index * dItemSize + dPaddingSize, (index + 1) * dItemSize + dPaddingSize];
          const listElScrollSize = listEl[dScrollY ? 'scrollTop' : 'scrollLeft'];
          const listElClientSize = listEl[dScrollY ? 'clientHeight' : 'clientWidth'];

          if (listElScrollSize > elOffset[1]) {
            listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = elOffset[0] - dPaddingSize;
          } else if (elOffset[0] > listElScrollSize + listElClientSize) {
            listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = elOffset[1] - listElClientSize + dPaddingSize;
          } else {
            if (next) {
              if (elOffset[1] > listElScrollSize + listElClientSize) {
                listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = elOffset[1] - listElClientSize + dPaddingSize;
              }
            } else {
              if (listElScrollSize > elOffset[0]) {
                listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = elOffset[0] - dPaddingSize;
              }
            }
          }

          changeFocusOption(option);
        }
      };

      asyncGroup.fromEvent<KeyboardEvent>(window, 'keydown').subscribe({
        next: (e) => {
          switch (e.code) {
            case 'ArrowUp':
              e.preventDefault();
              if (dScrollY) {
                changeFocusByKeydown(false);
              }
              break;

            case 'ArrowDown':
              e.preventDefault();
              if (dScrollY) {
                changeFocusByKeydown();
              }
              break;

            case 'ArrowLeft':
              e.preventDefault();
              if (!dScrollY) {
                changeFocusByKeydown(false);
              }
              break;

            case 'ArrowRight':
              e.preventDefault();
              if (!dScrollY) {
                changeFocusByKeydown();
              }
              break;

            case 'Home':
              e.preventDefault();
              listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = 0;
              for (const item of flatOptions) {
                if (item && dCanSelectOption(item)) {
                  changeFocusOption(item);
                  break;
                }
              }
              break;

            case 'End':
              e.preventDefault();
              listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = listEl[dScrollY ? 'scrollHeight' : 'scrollWidth'];
              for (let index = flatOptions.length - 1; index >= 0; index--) {
                const item = flatOptions[index];
                if (item && dCanSelectOption(item)) {
                  changeFocusOption(item);
                  break;
                }
              }
              break;

            default:
              break;
          }
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, changeFocusOption, dCanSelectOption, dItemSize, dPaddingSize, dRendered, dScrollY, flatOptions, focusIndex, listEl]);

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
