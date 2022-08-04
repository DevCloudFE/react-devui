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
  useLayout,
} from '../../hooks';
import { getClassName, registerComponentMate, toPx } from '../../utils';

export interface DAffixRef {
  sticky: boolean;
  updatePosition: () => void;
}

export interface DAffixProps extends React.HTMLAttributes<HTMLDivElement> {
  dContainer?: DElementSelector | false;
  dTop?: number | string;
  dZIndex?: number | string;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAffix' });
function Affix(props: DAffixProps, ref: React.ForwardedRef<DAffixRef>): JSX.Element | null {
  const {
    children,
    dContainer,
    dTop = 0,
    dZIndex,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dScrollEl, dResizeEl } = useLayout();
  //#endregion

  //#region Ref
  const affixRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  //#endregion

  const asyncCapture = useAsync();

  const scrollEl = useElement(dScrollEl);
  const resizeEl = useElement(dResizeEl);
  const containerEl = useElement(
    isUndefined(dContainer) || dContainer === false
      ? () => {
          if (isUndefined(dContainer)) {
            let el = document.getElementById(`${dPrefix}affix-root`);
            if (!el) {
              el = document.createElement('div');
              el.id = `${dPrefix}affix-root`;
              document.body.appendChild(el);
            }
            return el;
          }
          return null;
        }
      : dContainer
  );

  const [stickyStyle, setStickyStyle] = useState<React.CSSProperties>();
  const [referenceStyle, setReferenceStyle] = useState<React.CSSProperties>();
  const [sticky, setSticky] = useState(false);
  const updatePosition = useEventCallback(() => {
    const offsetEl = sticky ? referenceRef.current : affixRef.current;

    if (offsetEl) {
      const offsetRect = offsetEl.getBoundingClientRect();
      let containerTop = 0;
      if (!isUndefined(dContainer) && containerEl) {
        containerTop = containerEl.getBoundingClientRect().top;
      }
      const top = isString(dTop) ? toPx(dTop, true) : dTop;
      const sticky = offsetRect.top - containerTop <= top;

      if (sticky) {
        setStickyStyle({
          position: 'fixed',
          zIndex: dZIndex ?? `var(--${dPrefix}zindex-sticky)`,
          width: offsetRect.width,
          height: offsetRect.height,
          left: offsetRect.left,
          top: top + containerTop,
        });
        setReferenceStyle({
          width: offsetRect.width,
          height: offsetRect.height,
        });
      }
      setSticky(sticky);
    }
  });
  useIsomorphicLayoutEffect(() => {
    updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isUndefined(dContainer) && containerEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.fromEvent(containerEl, 'scroll', { passive: true }).subscribe({
        next: () => {
          updatePosition();
        },
      });

      asyncGroup.onResize(containerEl, () => {
        updatePosition();
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, containerEl, dContainer, updatePosition]);

  useEffect(() => {
    if (scrollEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.fromEvent(scrollEl, 'scroll', { passive: true }).subscribe({
        next: () => {
          updatePosition();
        },
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, scrollEl, updatePosition]);

  useEffect(() => {
    if (resizeEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.onResize(resizeEl, () => {
        updatePosition();
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, resizeEl, updatePosition]);

  useImperativeHandle(
    ref,
    () => ({
      sticky,
      updatePosition,
    }),
    [sticky, updatePosition]
  );

  return (
    <>
      {sticky && (
        <div
          {...restProps}
          ref={referenceRef}
          className={getClassName(restProps.className, `${dPrefix}affix`)}
          style={{
            ...restProps.style,
            ...referenceStyle,
            visibility: 'hidden',
          }}
          aria-hidden
        ></div>
      )}
      <div
        {...restProps}
        ref={affixRef}
        className={getClassName(restProps.className, `${dPrefix}affix`)}
        style={{
          ...restProps.style,
          ...(sticky ? stickyStyle : {}),
        }}
      >
        {children}
      </div>
    </>
  );
}

export const DAffix = React.forwardRef(Affix);
