import type { DElementSelector } from '../../hooks/element';

import { isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import ReactDOM from 'react-dom';

import {
  usePrefixConfig,
  useComponentConfig,
  useAsync,
  useElement,
  useRefCallback,
  useContentSVChangeConfig,
  useIsomorphicLayoutEffect,
  useForceUpdate,
  useCallbackWithState,
} from '../../hooks';
import { getClassName, mergeStyle, generateComponentMate } from '../../utils';

export interface DAffixRef {
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
  const onContentSVChange$ = useContentSVChangeConfig();
  //#endregion

  //#region Ref
  const [affixEl, affixRef] = useRefCallback<HTMLDivElement>();
  const [referenceEl, referenceRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const asyncCapture = useAsync();
  const forceUpdate = useForceUpdate();

  const targetEl = useElement(dTarget ?? null);

  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);
  useIsomorphicLayoutEffect(() => {
    let root = document.getElementById(`${dPrefix}affix-root`);
    if (!root) {
      root = document.createElement('div');
      root.id = `${dPrefix}affix-root`;
      document.body.appendChild(root);
    }
    setRootEl(root);
  }, [dPrefix]);

  const { fixedStyle, referenceStyle, fixed } = useCallbackWithState<{
    fixedStyle: React.CSSProperties;
    referenceStyle?: React.CSSProperties;
    fixed: boolean;
  }>(
    (draft) => {
      if (isUndefined(dTarget) || targetEl) {
        const offsetEl = draft.fixed ? referenceEl : affixEl;

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

          const changeFixed = (value: boolean) => {
            if (value !== draft.fixed) {
              draft.fixed = value;
              onFixedChange?.(value);
            }
          };
          if (fixedCondition) {
            draft.fixedStyle = {
              position: 'fixed',
              zIndex: dZIndex ?? `var(--${dPrefix}zindex-sticky)`,
              width: offsetRect.width,
              height: offsetRect.height,
              left: offsetRect.left,
              top: fixedTop,
            };
            draft.referenceStyle = {
              width: offsetRect.width,
              height: offsetRect.height,
            };
            changeFixed(true);
          } else {
            changeFixed(false);
          }
        }
      }
    },
    {
      fixedStyle: {},
      referenceStyle: {},
      fixed: false,
    }
  )();

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (referenceEl) {
      asyncGroup.onResize(referenceEl, forceUpdate);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, forceUpdate, referenceEl]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    const ob = onContentSVChange$?.subscribe({
      next: () => {
        forceUpdate();
      },
    });
    asyncGroup.onGlobalScroll(forceUpdate);
    return () => {
      ob?.unsubscribe();
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, forceUpdate, onContentSVChange$]);

  useImperativeHandle(
    ref,
    () => ({
      updatePosition: () => {
        forceUpdate();
      },
    }),
    [forceUpdate]
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
