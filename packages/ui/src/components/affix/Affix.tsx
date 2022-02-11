import type { DElementSelector } from '../../hooks/element';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import {
  usePrefixConfig,
  useComponentConfig,
  useAsync,
  useElement,
  useImmer,
  useRefCallback,
  useContentSVChangeConfig,
  useIsomorphicLayoutEffect,
} from '../../hooks';
import { getClassName, mergeStyle, generateComponentMate } from '../../utils';

export interface DAffixRef {
  el: HTMLDivElement | null;
  updatePosition: () => void;
}

export interface DAffixProps extends React.HTMLAttributes<HTMLDivElement> {
  dTarget?: DElementSelector;
  dTop?: number;
  dBottom?: number;
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
  const contentSVChange = useContentSVChangeConfig();
  //#endregion

  //#region Ref
  const [affixEl, affixRef] = useRefCallback<HTMLDivElement>();
  const [referenceEl, referenceRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const dataRef = useRef<{
    rect?: { top: number; left: number };
  }>({});

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

  const targetEl = useElement(dTarget ?? null);

  const [rootEl, setRootEl] = useState<HTMLElement>();
  useIsomorphicLayoutEffect(() => {
    let root = document.getElementById(`${dPrefix}affix-root`);
    if (!root) {
      root = document.createElement('div');
      root.id = `${dPrefix}affix-root`;
      document.body.appendChild(root);
    }
    setRootEl(root);
  }, [dPrefix]);

  const updatePosition = useCallback(() => {
    if (isUndefined(dTarget) || targetEl) {
      const offsetEl = fixed ? referenceEl : affixEl;

      if (offsetEl) {
        let targetRect = {
          top: 0,
          bottom: window.innerHeight,
        };
        if (targetEl) {
          targetRect = targetEl.getBoundingClientRect();
        }

        const offsetRect = offsetEl.getBoundingClientRect();

        let fixedCondition = offsetRect.top - targetRect.top <= dTop;
        let fixedTop = targetRect.top + dTop;
        if (!isUndefined(props.dBottom)) {
          fixedCondition = targetRect.bottom - offsetRect.bottom <= dBottom;
          fixedTop = targetRect.bottom - dBottom - offsetRect.height;
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
    targetEl,
    fixed,
    referenceEl,
    affixEl,
    dTop,
    props.dBottom,
    dBottom,
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
    const skipUpdate = () => {
      const el = fixed ? referenceEl : affixEl;
      if (el) {
        const { top, left } = el.getBoundingClientRect();

        const skip = dataRef.current.rect?.top === top && dataRef.current.rect?.left === left;
        dataRef.current.rect = { top, left };
        return skip;
      }

      return false;
    };
    const ob = contentSVChange?.subscribe({
      next: () => {
        if (!skipUpdate()) {
          updatePosition();
        }
      },
    });
    asyncGroup.onGlobalScroll(updatePosition, skipUpdate);
    return () => {
      ob?.unsubscribe();
      asyncCapture.deleteGroup(asyncId);
    };
  }, [affixEl, asyncCapture, fixed, referenceEl, contentSVChange, updatePosition]);

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
      {rootEl &&
        ReactDOM.createPortal(
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
