import type { DElementSelector } from '../../hooks/element-ref';

import { isString, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useImperativeHandle } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useAsync,
  useRefSelector,
  useImmer,
  useRefCallback,
  useRootContentConfig,
  useValueChange,
} from '../../hooks';
import { getClassName, toPx, mergeStyle } from '../../utils';

export interface DAffixRef {
  el: HTMLDivElement | null;
  updatePosition: () => void;
}

export interface DAffixProps extends React.HTMLAttributes<HTMLDivElement> {
  dTarget?: DElementSelector;
  dTop?: string | number;
  dBottom?: string | number;
  dZIndex?: number;
  onFixedChange?: (fixed: boolean) => void;
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
  } = useComponentConfig(DAffix.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const rootContentRef = useRootContentConfig();
  //#endregion

  //#region Ref
  const [affixEl, affixRef] = useRefCallback<HTMLDivElement>();
  const [referenceEl, referenceRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const asyncCapture = useAsync();
  const [fixed, setFixed] = useImmer(false);
  const [fixedStyle, setFixedStyle] = useImmer<React.CSSProperties>({});
  const [referenceStyle, setReferenceStyle] = useImmer<React.CSSProperties>({});

  const targetRef = useRefSelector(dTarget ?? null);

  const top = isString(dTop) ? toPx(dTop, true) : dTop;
  const bottom = isString(dBottom) ? toPx(dBottom, true) : dBottom;

  useValueChange(fixed, onFixedChange);

  const updatePosition = useCallback(() => {
    if ((isUndefined(dTarget) || targetRef.current) && affixEl && referenceEl) {
      let targetRect = {
        top: 0,
        bottom: window.innerHeight,
      };
      if (targetRef.current) {
        targetRect = targetRef.current.getBoundingClientRect();
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
        setFixed(true);
      } else {
        setFixed(false);
      }
    }
  }, [dTarget, targetRef, affixEl, referenceEl, fixed, top, props.dBottom, bottom, setFixedStyle, dZIndex, setReferenceStyle, setFixed]);
  //#endregion

  //#region DidUpdate
  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (fixed && referenceEl) {
      asyncGroup.onResize(referenceEl, updatePosition);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, fixed, referenceEl, updatePosition]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (rootContentRef.current) {
      asyncGroup.onResize(rootContentRef.current, updatePosition);
    }
    asyncGroup.onGlobalScroll(updatePosition);
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, rootContentRef, updatePosition]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);
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
        style={mergeStyle(style, {
          ...(fixed ? fixedStyle : {}),
        })}
      >
        {children}
      </div>
      <div {...restProps} ref={referenceRef} className={className} style={{ ...style, visibility: 'hidden' }} aria-hidden={true}>
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
