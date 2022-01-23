import type { DElementSelector } from '../../hooks/element-ref';

import { isString, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

import { usePrefixConfig, useComponentConfig, useAsync, useRefSelector, useImmer, useRefCallback, useContentRefConfig } from '../../hooks';
import { getClassName, toPx, mergeStyle, generateComponentMate } from '../../utils';

export interface DAffixRef {
  el: HTMLDivElement | null;
  updatePosition: () => void;
}

export interface DAffixProps extends React.HTMLAttributes<HTMLDivElement> {
  dTarget?: DElementSelector;
  dTop?: number | string;
  dBottom?: number | string;
  dZIndex?: number | string;
  onFixedChange?: (fixed: boolean) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DAffix');
const Affix: React.ForwardRefRenderFunction<DAffixRef, DAffixProps> = (props, ref) => {
  const {
    dTarget,
    dTop = 0,
    dBottom = 0,
    dZIndex,
    onFixedChange,
    className,
    style,
    children,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const rootContentRef = useContentRefConfig();
  //#endregion

  //#region Ref
  const [affixEl, affixRef] = useRefCallback<HTMLDivElement>();
  const [referenceEl, referenceRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const asyncCapture = useAsync();

  const [fixedStyle, setFixedStyle] = useImmer<React.CSSProperties>({});
  const [referenceStyle, setReferenceStyle] = useImmer<React.CSSProperties>({});

  const [fixed, setFixed] = useState(false);
  const changeFixed = useCallback(
    (value) => {
      if (value !== fixed) {
        setFixed(value);
        onFixedChange?.(value);
      }
    },
    [fixed, onFixedChange]
  );

  const targetRef = useRefSelector(dTarget ?? null);

  const top = isString(dTop) ? toPx(dTop, true) : dTop;
  const bottom = isString(dBottom) ? toPx(dBottom, true) : dBottom;

  const rootEl = useMemo(() => {
    let root = document.getElementById(`${dPrefix}affix-root`);
    if (!root) {
      root = document.createElement('div');
      root.id = `${dPrefix}affix-root`;
      document.body.appendChild(root);
    }

    return root;
  }, [dPrefix]);

  const updatePosition = useCallback(() => {
    if (isUndefined(dTarget) || targetRef.current) {
      const offsetEl = fixed ? referenceEl : affixEl;

      if (offsetEl) {
        let targetRect = {
          top: 0,
          bottom: window.innerHeight,
        };
        if (targetRef.current) {
          targetRect = targetRef.current.getBoundingClientRect();
        }

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
            zIndex: dZIndex ?? `var(--${dPrefix}zindex-sticky)`,
            width: offsetRect.width,
            height: offsetRect.height,
            left: offsetRect.left,
            top: fixedTop,
          });
          setReferenceStyle({
            width: offsetRect.width,
            height: offsetRect.height,
          });
          changeFixed(true);
        } else {
          changeFixed(false);
        }
      }
    }
  }, [
    dTarget,
    targetRef,
    affixEl,
    referenceEl,
    fixed,
    top,
    props.dBottom,
    bottom,
    setFixedStyle,
    dZIndex,
    dPrefix,
    setReferenceStyle,
    changeFixed,
  ]);

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

  useImperativeHandle(
    ref,
    () => ({
      el: affixEl,
      updatePosition: () => updatePosition(),
    }),
    [affixEl, updatePosition]
  );

  return fixed ? (
    <>
      <div
        {...restProps}
        ref={referenceRef}
        className={getClassName(className, `${dPrefix}affix`)}
        style={{
          ...style,
          ...referenceStyle,
          visibility: 'hidden',
        }}
        aria-hidden={true}
      ></div>
      {ReactDOM.createPortal(
        <div {...restProps} className={getClassName(className, `${dPrefix}affix`)} style={mergeStyle(fixedStyle, style)}>
          {children}
        </div>,
        rootEl
      )}
    </>
  ) : (
    <div {...restProps} ref={affixRef} className={getClassName(className, `${dPrefix}affix`)} style={style}>
      {children}
    </div>
  );
};

export const DAffix = React.forwardRef(Affix);
