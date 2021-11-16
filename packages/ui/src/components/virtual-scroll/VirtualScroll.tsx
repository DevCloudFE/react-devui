import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useImmer } from 'use-immer';

import { useDComponentConfig, useElement, useId, useThrottle, useAsync } from '../../hooks';

export interface DVirtualScrollProps<T> {
  dTag?: string;
  dWidth?: string | number;
  dHeight?: string | number;
  dItemWidth?: number;
  dItemHeight?: number;
  dList: T[];
  dRenderItem: (item: T, index: number) => React.ReactNode;
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
    dRenderItem,
    dCustomSize,
    onScrollEnd,
    style,
    onScroll,
    ...restProps
  } = useDComponentConfig('virtual-scroll', props);

  const { throttleByAnimationFrame } = useThrottle();
  const asyncCapture = useAsync();

  //#region States.
  /*
   * @see https://reactjs.org/docs/state-and-lifecycle.html
   *
   * - Vue: data.
   * @see https://v3.vuejs.org/api/options-data.html#data-2
   * - Angular: property on a class.
   * @example
   * export class HeroChildComponent {
   *   public data: 'example';
   * }
   */
  const id = useId();

  const [list, setList] = useImmer<React.ReactNode[]>([]);
  const [fillSize, setFillSize] = useImmer<[React.CSSProperties, React.CSSProperties]>([{}, {}]);
  //#endregion

  //#region Element
  const el = useElement(`[data-d-virtual-scroll-${id}]`);
  const referenceEl = useElement(`[data-d-virtual-scroll-reference-${id}]`);
  //#endregion

  //#region Getters.
  /*
   * When the dependency changes, recalculate the value.
   * In React, usually use `useMemo` to handle this situation.
   * Notice: `useCallback` also as getter that target at function.
   *
   * - Vue: computed.
   * @see https://v3.vuejs.org/guide/computed.html#computed-properties
   * - Angular: get property on a class.
   * @example
   * // ReactConvertService is a service that implement the
   * // methods when need to convert react to angular.
   * export class HeroChildComponent {
   *   public get data():string {
   *     return this.reactConvert.useMemo(factory, [deps]);
   *   }
   *
   *   constructor(private reactConvert: ReactConvertService) {}
   * }
   */
  const itemSizeArr = useMemo(() => (dCustomSize ? dList.map((item, index) => dCustomSize(item, index)) : []), [dCustomSize, dList]);

  const updateList = useCallback(() => {
    if (el.current) {
      const scrollSize = isUndefined(dWidth) ? el.current.scrollTop : el.current.scrollLeft;
      const rect = el.current.getBoundingClientRect();
      const size = isUndefined(dWidth) ? dItemHeight ?? rect.height : dItemWidth ?? rect.width;
      if (isUndefined(dCustomSize)) {
        if (referenceEl.current) {
          const itemSize = isUndefined(dWidth)
            ? referenceEl.current.getBoundingClientRect().height
            : referenceEl.current.getBoundingClientRect().width;

          if (size && itemSize) {
            const startIndex = Math.max(~~(scrollSize / itemSize) - 2, 1);
            const endIndex = Math.min(~~(scrollSize / itemSize) + ~~(size / itemSize) + 1 + 2, dList.length);
            setList(dList.slice(startIndex, endIndex).map((item, index) => dRenderItem(item, startIndex + index)));

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
          for (const [index, itemSize] of itemSizeArr.entries()) {
            accumulateSize += itemSize;
            if (accumulateSize > scrollSize && isUndefined(startInfo)) {
              startInfo = [index, accumulateSize];
            }
            if (accumulateSize > scrollSize + size && isUndefined(endInfo)) {
              endInfo = [index, accumulateSize];
            }
          }

          const startIndex = Math.max((startInfo?.[0] ?? 0) - 2, 0);
          const endIndex = Math.min((endInfo?.[0] ?? dList.length) + 1 + 2, dList.length);
          setList(dList.slice(startIndex, endIndex).map((item, index) => dRenderItem(item, startIndex + index)));

          const preFillSize = Math.max(
            startInfo
              ? (startInfo[1] ?? 0) -
                  (itemSizeArr[startInfo[0]] ?? 0) -
                  (itemSizeArr[startInfo[0] - 1] ?? 0) -
                  (itemSizeArr[startInfo[0] - 2] ?? 0)
              : 0,
            0
          );
          const sufFillSize = Math.max(
            endInfo ? accumulateSize - endInfo[1] - (itemSizeArr[endInfo[0] + 1] ?? 0) - (itemSizeArr[endInfo[0] + 2] ?? 0) : 0,
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
  }, [el, dWidth, dItemHeight, dItemWidth, dCustomSize, referenceEl, dList, setList, setFillSize, onScrollEnd, dRenderItem, itemSizeArr]);

  const reference = useMemo(() => {
    if (dList[0] && isUndefined(dCustomSize)) {
      const _reference = dRenderItem(dList[0], 0) as React.ReactElement;
      const [asyncGroup] = asyncCapture.createGroup('reference');
      asyncGroup.setTimeout(() => {
        if (referenceEl.current) {
          asyncGroup.onResize(referenceEl.current, () => throttleByAnimationFrame(updateList));
        }
      }, 20);
      return React.cloneElement(_reference, {
        ..._reference.props,
        [`data-d-virtual-scroll-reference-${id}`]: 'true',
      });
    }
  }, [asyncCapture, dCustomSize, dList, dRenderItem, id, referenceEl, throttleByAnimationFrame, updateList]);

  const handleScroll = useCallback(
    (e) => {
      (onScroll as React.UIEventHandler<HTMLElement>)?.(e);
      throttleByAnimationFrame(updateList);
    },
    [onScroll, throttleByAnimationFrame, updateList]
  );
  //#endregion

  //#region DidUpdate.
  /*
   * We need a service(ReactConvertService) that implement useEffect.
   * @see https://reactjs.org/docs/hooks-effect.html
   *
   * - Vue: onUpdated.
   * @see https://v3.vuejs.org/api/composition-api.html#lifecycle-hooks
   * - Angular: ngDoCheck.
   * @see https://angular.io/api/core/DoCheck
   */
  useEffect(() => {
    throttleByAnimationFrame(updateList);
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
      [`data-d-virtual-scroll-${id}`]: 'true',
      onScroll: handleScroll,
    },
    [
      reference,
      <div
        key={`d-virtual-scroll-pre-fill-${id}`}
        style={{
          ...fillSize[0],
          display: isUndefined(dWidth) ? undefined : 'inline-block',
        }}
      ></div>,
      ...list,
      <div
        key={`d-virtual-scroll-sub-fill-${id}`}
        style={{
          ...fillSize[1],
          display: isUndefined(dWidth) ? undefined : 'inline-block',
        }}
      ></div>,
    ]
  );
}
