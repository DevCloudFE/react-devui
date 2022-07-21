import type { DElementSelector } from '../../hooks/ui/useElement';

import { isString, isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useAsync,
  useElement,
  useIsomorphicLayoutEffect,
  useEventCallback,
  useUpdatePosition,
} from '../../hooks';
import { getClassName, registerComponentMate, toPx } from '../../utils';

export interface DAffixRef {
  fixed: boolean;
  updatePosition: () => void;
}

export interface DAffixProps extends React.HTMLAttributes<HTMLDivElement> {
  dTarget?: DElementSelector;
  dTop?: number | string;
  dBottom?: number | string;
  dZIndex?: number | string;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAffix' });
function Affix(props: DAffixProps, ref: React.ForwardedRef<DAffixRef>): JSX.Element | null {
  const {
    children,
    dTarget,
    dTop = 0,
    dBottom,
    dZIndex,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const affixRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  //#endregion

  const asyncCapture = useAsync();

  const targetEl = useElement(dTarget ?? null);

  const [fixedStyle, setFixedStyle] = useState<React.CSSProperties>();
  const [referenceStyle, setReferenceStyle] = useState<React.CSSProperties>();
  const [fixed, setFixed] = useState(false);
  const updatePosition = useEventCallback(() => {
    if (isUndefined(dTarget) || targetEl) {
      const offsetEl = fixed ? referenceRef.current : affixRef.current;

      if (offsetEl) {
        let targetRect = {
          top: 0,
          bottom: window.innerHeight,
        };
        if (targetEl) {
          targetRect = targetEl.getBoundingClientRect();
        }

        const offsetRect = offsetEl.getBoundingClientRect();

        const top = isString(dTop) ? toPx(dTop, true) : dTop;
        let fixed = offsetRect.top - targetRect.top <= top;
        let fixedTop = targetRect.top + top;
        if (!isUndefined(dBottom)) {
          const bottom = isString(dBottom) ? toPx(dBottom, true) : dBottom;
          fixed = targetRect.bottom - offsetRect.bottom <= bottom;
          fixedTop = targetRect.bottom - bottom - offsetRect.height;
        }

        if (fixed) {
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
        }
        setFixed(fixed);
      }
    }
  });
  useIsomorphicLayoutEffect(() => {
    updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useUpdatePosition(updatePosition);

  useEffect(() => {
    if (targetEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.fromEvent(targetEl, 'scroll', { passive: true }).subscribe({
        next: () => {
          updatePosition();
        },
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, targetEl, updatePosition]);

  useImperativeHandle(
    ref,
    () => ({
      fixed,
      updatePosition,
    }),
    [fixed, updatePosition]
  );

  return (
    <>
      {fixed && (
        <div
          {...restProps}
          ref={referenceRef}
          className={getClassName(restProps.className, `${dPrefix}affix`)}
          style={{
            ...restProps.style,
            ...referenceStyle,
            visibility: 'hidden',
          }}
          aria-hidden={true}
        ></div>
      )}
      <div
        {...restProps}
        ref={affixRef}
        className={getClassName(restProps.className, `${dPrefix}affix`)}
        style={{
          ...restProps.style,
          ...(fixed ? fixedStyle : {}),
        }}
      >
        {children}
      </div>
    </>
  );
}

export const DAffix = React.forwardRef(Affix);
