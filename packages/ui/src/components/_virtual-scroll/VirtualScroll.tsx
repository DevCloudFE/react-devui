import { isArray } from 'lodash';
import React, { useEffect, useRef } from 'react';

import { useAsync, useEventCallback, useForceUpdate, useRefCallback, useCallbackWithCondition } from '../../hooks';

export interface DItemRenderProps {
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  children?: React.ReactNode;
}

export interface DVirtualScrollProps<T> extends React.HTMLAttributes<HTMLElement> {
  dFocusOption: T | null;
  dHasSelected?: boolean;
  dRendered?: boolean;
  dScrollY?: boolean;
  dSize: number;
  dItemSize: number;
  dPaddingSize?: number;
  dList: T[];
  dNestedKey?: string;
  dNestedAsItem?: boolean;
  dCanSelectOption: (option: T) => boolean;
  dCompareOption: (a: T, b: T) => boolean;
  dItemRender: (item: T, props: DItemRenderProps) => React.ReactNode;
  dEmpty?: React.ReactNode;
  onScrollEnd?: () => void;
  onFocusChange?: (option: T | null) => void;
}

export function DVirtualScroll<T>(props: DVirtualScrollProps<T>): JSX.Element | null {
  const {
    dFocusOption,
    dHasSelected = false,
    dRendered = true,
    dScrollY = true,
    dSize,
    dItemSize,
    dPaddingSize = 0,
    dList,
    dNestedKey,
    dNestedAsItem = false,
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
  const [listEl, listRef] = useRefCallback<HTMLUListElement>();
  //#endregion

  const dataRef = useRef<{
    hasInitFocus: boolean;
  }>({
    hasInitFocus: dHasSelected,
  });

  const asyncCapture = useAsync();
  const forceUpdate = useForceUpdate();

  const updateList = () => {
    const [flatOptions, focusIndex] = (() => {
      const flatOptions: (T | undefined)[] = [];
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
            if (dFocusOption && dCompareOption(dFocusOption, item)) {
              hasFind = true;
            }

            if (dNestedKey && isArray(item[dNestedKey])) {
              reduceList(item[dNestedKey] as T[]);
            }
          });
        }
      };
      reduceList(dList);

      return [flatOptions, hasFind ? focusIndex : -1];
    })();

    const [list, fillSize] = (() => {
      const maxScrollSize = dItemSize * flatOptions.length + dPaddingSize * 2 - dSize;
      const scrollSize = Math.min(maxScrollSize, dScrollY ? listEl?.scrollTop ?? 0 : listEl?.scrollLeft ?? 0);

      const startCount = Math.floor((scrollSize - dPaddingSize) / dItemSize) - 2;
      const endCount = Math.ceil((scrollSize - dPaddingSize + dSize) / dItemSize) + 2;

      let count = 0;
      let skipCount = 0;
      let renderCount = 0;
      const loop = (arr: T[]) => {
        let skipNestedItem = 0;
        const size = !dNestedAsItem && dNestedKey ? arr.length - arr.filter((item) => isArray(item[dNestedKey])).length : arr.length;
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
            if (dNestedKey && isArray(arr[index][dNestedKey])) {
              if (!dNestedAsItem) {
                skipNestedItem += 1;
              }
              const children = loop(arr[index][dNestedKey] as T[]);
              if (shouldRender || children.length > 0) {
                renderCount += 1;
                list.push(
                  dItemRender(
                    arr[index],
                    dNestedAsItem
                      ? {
                          'aria-setsize': size,
                          'aria-posinset': index + 1,
                          children,
                        }
                      : { children }
                  )
                );
              } else {
                skipCount += 1;
              }
            } else {
              if (shouldRender) {
                renderCount += 1;
                list.push(
                  dItemRender(arr[index], {
                    'aria-setsize': size,
                    'aria-posinset': index + 1 - skipNestedItem,
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

      return [
        loop(dList),
        [
          { [dScrollY ? 'height' : 'width']: dItemSize * skipCount },
          { [dScrollY ? 'height' : 'width']: dItemSize * (flatOptions.length - skipCount - renderCount) },
        ],
      ];
    })();

    return { flatOptions, focusIndex, list, fillSize };
  };
  const { flatOptions, focusIndex, list, fillSize } = useCallbackWithCondition(dRendered, updateList)();

  useEffect(() => {
    if (dRendered) {
      if (dataRef.current.hasInitFocus && listEl) {
        dataRef.current.hasInitFocus = false;
        listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = focusIndex * dItemSize;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dRendered]);

  const changeScroll = (num: number) => {
    if (listEl) {
      listEl[dScrollY ? 'scrollTop' : 'scrollLeft'] = num;
    }
  };
  const changeFocusByKeydown = useEventCallback((next = true) => {
    if (listEl) {
      let index = focusIndex;
      let option: T | undefined;
      const getOption = () => {
        if (!next && index === 0) {
          changeScroll(0);
          return;
        }
        if (next && index === flatOptions.length - 1) {
          changeScroll(listEl[dScrollY ? 'scrollHeight' : 'scrollWidth']);
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
          changeScroll(elOffset[0] - dPaddingSize);
        } else if (elOffset[0] > listElScrollSize + listElClientSize) {
          changeScroll(elOffset[1] - listElClientSize + dPaddingSize);
        } else {
          if (next) {
            if (elOffset[1] > listElScrollSize + listElClientSize) {
              changeScroll(elOffset[1] - listElClientSize + dPaddingSize);
            }
          } else {
            if (listElScrollSize > elOffset[0]) {
              changeScroll(elOffset[0] - dPaddingSize);
            }
          }
        }

        onFocusChange?.(option);
      }
    }
  });
  const handleHomeKeydown = useEventCallback((e) => {
    e.preventDefault();
    changeScroll(0);

    let option: T | null = null;
    for (const item of flatOptions) {
      if (item && dCanSelectOption(item)) {
        option = item;
        break;
      }
    }
    onFocusChange?.(option);
  });
  const handleEndKeydown = useEventCallback((e) => {
    e.preventDefault();
    listEl && changeScroll(listEl[dScrollY ? 'scrollHeight' : 'scrollWidth']);

    let option: T | null = null;
    for (let index = flatOptions.length - 1; index >= 0; index--) {
      const item = flatOptions[index];
      if (item && dCanSelectOption(item)) {
        option = item;
        break;
      }
    }
    onFocusChange?.(option);
  });
  const hasFocus = focusIndex !== -1;
  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (dRendered && hasFocus) {
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
              handleHomeKeydown(e);
              break;

            case 'End':
              handleEndKeydown(e);
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
  }, [asyncCapture, changeFocusByKeydown, dRendered, dScrollY, handleEndKeydown, handleHomeKeydown, hasFocus]);

  const handleScroll: React.UIEventHandler<HTMLUListElement> = (e) => {
    onScroll?.(e);

    if (listEl) {
      if (
        (dScrollY && listEl.scrollTop + listEl.clientHeight === listEl.scrollHeight) ||
        (!dScrollY && listEl.scrollLeft + listEl.clientWidth === listEl.scrollWidth)
      ) {
        onScrollEnd?.();
      }
    }

    forceUpdate();
  };

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
