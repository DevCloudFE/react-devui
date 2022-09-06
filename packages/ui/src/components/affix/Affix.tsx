import type { DElementSelector } from '@react-devui/hooks/useElement';

import { isString, isUndefined } from 'lodash';
import React, { useImperativeHandle, useRef, useState } from 'react';

import { useElement, useEvent, useEventCallback, useIsomorphicLayoutEffect, useResize } from '@react-devui/hooks';
import { getClassName, toPx } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useLayout } from '../../hooks';
import { registerComponentMate } from '../../utils';

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

  const isDefaultContainer = isUndefined(dContainer);

  const [sticky, setSticky] = useState(false);

  const scrollEl = useElement(dScrollEl);
  const resizeEl = useElement(dResizeEl);
  const containerEl = useElement(
    isDefaultContainer
      ? () => {
          let el = document.getElementById(`${dPrefix}affix-root`);
          if (!el) {
            el = document.createElement('div');
            el.id = `${dPrefix}affix-root`;
            document.body.appendChild(el);
          }
          return el;
        }
      : dContainer === false
      ? () => {
          const el = sticky ? referenceRef.current : affixRef.current;
          return el?.parentElement ?? null;
        }
      : dContainer
  );

  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>();
  const [referenceStyle, setReferenceStyle] = useState<React.CSSProperties>();
  const updatePosition = useEventCallback(() => {
    const offsetEl = sticky ? referenceRef.current : affixRef.current;

    if (offsetEl) {
      const offsetRect = offsetEl.getBoundingClientRect();
      let containerTop = 0;
      if (!isDefaultContainer && containerEl) {
        containerTop = containerEl.getBoundingClientRect().top;
      }
      const top = isString(dTop) ? toPx(dTop, true) : dTop;
      const sticky = offsetRect.top - containerTop <= top;

      if (sticky) {
        setPositionStyle({
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

  useResize(isDefaultContainer ? null : containerEl, updatePosition);
  useResize(resizeEl, updatePosition);
  useEvent(isDefaultContainer ? null : containerEl, 'scroll', updatePosition, { passive: true });
  useEvent(scrollEl, 'scroll', updatePosition, { passive: true });

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
          ...(sticky
            ? {
                position: 'fixed',
                zIndex: dZIndex ?? `var(--${dPrefix}zindex-sticky)`,
                ...positionStyle,
              }
            : {}),
        }}
      >
        {children}
      </div>
    </>
  );
}

export const DAffix = React.forwardRef(Affix);
