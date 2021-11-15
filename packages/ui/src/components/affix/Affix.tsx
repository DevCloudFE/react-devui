import type { DElementSelector } from '../../hooks/element';

import { isString, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useImperativeHandle, useMemo } from 'react';
import { useImmer } from 'use-immer';

import { useDPrefixConfig, useDComponentConfig, useCustomRef, useAsync, useThrottle, useElement } from '../../hooks';
import { getClassName, toPx, globalScrollCapture } from '../../utils';

export interface DAffixProps extends React.HTMLAttributes<HTMLDivElement> {
  dTarget?: DElementSelector;
  dTop?: string | number;
  dBottom?: string | number;
  dZIndex?: number;
  onFixedChange?: (fixed: boolean) => void;
}

export interface DAffixRef {
  el: HTMLDivElement | null;
  updatePosition: () => void;
}

export const DAffix = React.forwardRef<DAffixRef, DAffixProps>((props, ref) => {
  const {
    dTarget,
    dTop = 0,
    dBottom,
    dZIndex = 900,
    onFixedChange,
    className,
    style,
    children,
    ...restProps
  } = useDComponentConfig('affix', props);

  const dPrefix = useDPrefixConfig();
  const { throttleByAnimationFrame } = useThrottle();
  const asyncCapture = useAsync();

  //#region Refs.
  /*
   * @see https://reactjs.org/docs/refs-and-the-dom.html
   *
   * - Vue: ref.
   * @see https://v3.vuejs.org/guide/component-template-refs.html
   * - Angular: ViewChild.
   * @see https://angular.io/api/core/ViewChild
   */
  const [affixEl, affixRef] = useCustomRef<HTMLDivElement>();
  const [referenceEl, referenceRef] = useCustomRef<HTMLDivElement>();
  //#endregion

  //#region Element
  const targetEl = useElement(dTarget ?? null);
  //#endregion

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
  const [fixed, setFixed] = useImmer<boolean | undefined>(undefined);
  const [fixedStyle, setFixedStyle] = useImmer<React.CSSProperties>({});
  const [referenceStyle, setReferenceStyle] = useImmer<React.CSSProperties>({});
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
  const top = useMemo(() => (isString(dTop) ? toPx(dTop, true) : dTop), [dTop]);
  const bottom = useMemo(() => (isString(dBottom) ? toPx(dBottom, true) : dBottom ?? 0), [dBottom]);

  const updatePosition = useCallback(() => {
    if ((isUndefined(dTarget) || targetEl.current) && affixEl && referenceEl) {
      let targetRect = {
        top: 0,
        bottom: window.innerHeight,
      };
      if (targetEl.current) {
        targetRect = targetEl.current.getBoundingClientRect();
      }

      const offsetEl = fixed === true ? referenceEl : affixEl;
      const offsetRect = offsetEl.getBoundingClientRect();

      let fixedCondition = offsetRect.top - targetRect.top <= top;
      let fixedTop = targetRect.top + top;
      if (!isUndefined(dBottom)) {
        fixedCondition = targetRect.bottom - offsetRect.bottom <= bottom;
        fixedTop = targetRect.bottom - bottom - offsetRect.height;
      }

      if (fixedCondition) {
        setFixedStyle({
          position: 'fixed',
          zIndex: dZIndex,
          width: offsetRect.width,
          height: offsetRect.height,
          left: offsetRect.left,
          top: fixedTop,
        });
        const affixRect = affixEl.getBoundingClientRect();
        setReferenceStyle({
          width: affixRect.width,
          height: affixRect.height,
        });
        if (!isUndefined(fixed) && fixed === false) {
          onFixedChange?.(true);
        }
        setFixed(true);
      } else {
        if (!isUndefined(fixed) && fixed === true) {
          onFixedChange?.(false);
        }
        setFixed(false);
      }
    }
  }, [
    dTarget,
    dBottom,
    dZIndex,
    top,
    bottom,
    fixed,
    affixEl,
    referenceEl,
    targetEl,
    onFixedChange,
    setFixed,
    setFixedStyle,
    setReferenceStyle,
  ]);
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
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (fixed && referenceEl) {
      asyncGroup.onResize(referenceEl, () => throttleByAnimationFrame(updatePosition));
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [throttleByAnimationFrame, asyncCapture, fixed, referenceEl, updatePosition]);

  useEffect(() => {
    const tid = globalScrollCapture.addTask(() => throttleByAnimationFrame(updatePosition));
    return () => {
      globalScrollCapture.deleteTask(tid);
    };
  }, [throttleByAnimationFrame, updatePosition]);

  useEffect(() => {
    throttleByAnimationFrame(updatePosition);
  }, [throttleByAnimationFrame, updatePosition]);
  //#endregion

  useImperativeHandle(
    ref,
    () => ({
      el: affixEl,
      updatePosition: () => updatePosition(),
    }),
    [affixEl, updatePosition]
  );

  return (
    <>
      <div
        {...restProps}
        ref={affixRef}
        className={getClassName(className, `${dPrefix}affix`)}
        style={{
          ...style,
          ...(fixed ? fixedStyle : {}),
        }}
      >
        {children}
      </div>
      <div {...restProps} ref={referenceRef} className={className} style={{ ...style, visibility: 'hidden' }} aria-hidden="true">
        <div
          style={{
            ...referenceStyle,
            ...(fixed ? {} : { display: 'none' }),
          }}
        ></div>
      </div>
    </>
  );
});
