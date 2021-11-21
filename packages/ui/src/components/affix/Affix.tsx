import type { DElementSelector } from '../../hooks/element';

import { isString, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useImperativeHandle } from 'react';
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
    dBottom = 0,
    dZIndex = 900,
    onFixedChange,
    className,
    style,
    children,
    ...restProps
  } = useDComponentConfig('affix', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  //#region Ref
  const [affixEl, affixRef] = useCustomRef<HTMLDivElement>();
  const [referenceEl, referenceRef] = useCustomRef<HTMLDivElement>();
  //#endregion

  const { throttleByAnimationFrame } = useThrottle();
  const asyncCapture = useAsync();
  const [fixed, setFixed] = useImmer<boolean | undefined>(undefined);
  const [fixedStyle, setFixedStyle] = useImmer<React.CSSProperties>({});
  const [referenceStyle, setReferenceStyle] = useImmer<React.CSSProperties>({});

  const targetEl = useElement(dTarget ?? null);

  const top = isString(dTop) ? toPx(dTop, true) : dTop;
  const bottom = isString(dBottom) ? toPx(dBottom, true) : dBottom;

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
      if (!isUndefined(props.dBottom)) {
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
    targetEl,
    affixEl,
    referenceEl,
    fixed,
    top,
    props.dBottom,
    bottom,
    setFixedStyle,
    dZIndex,
    setReferenceStyle,
    setFixed,
    onFixedChange,
  ]);
  //#endregion

  //#region DidUpdate
  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (fixed && referenceEl) {
      asyncGroup.onResize(referenceEl, () => throttleByAnimationFrame.run(updatePosition));
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [throttleByAnimationFrame, asyncCapture, fixed, referenceEl, updatePosition]);

  useEffect(() => {
    const tid = globalScrollCapture.addTask(() => throttleByAnimationFrame.run(updatePosition));
    return () => {
      globalScrollCapture.deleteTask(tid);
    };
  }, [throttleByAnimationFrame, updatePosition]);

  useEffect(() => {
    throttleByAnimationFrame.run(updatePosition);
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
