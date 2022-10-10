import type { DRefExtra } from '@react-devui/hooks/useRefExtra';

import { isString, isUndefined } from 'lodash';
import React, { useImperativeHandle, useState } from 'react';

import { useEvent, useEventCallback, useId, useIsomorphicLayoutEffect, useRefExtra, useResize } from '@react-devui/hooks';
import { getOffsetToRoot, toPx } from '@react-devui/utils';

import { cloneHTMLElement, registerComponentMate } from '../../utils';
import { useComponentConfig, useGlobalScroll, useLayout, usePrefixConfig } from '../root';

export interface DAffixRef {
  sticky: boolean;
  updatePosition: () => void;
}

export interface DAffixProps {
  children: React.ReactElement;
  dTarget?: DRefExtra | false;
  dTop?: number | string;
  dZIndex?: number | string;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAffix' as const });
function Affix(props: DAffixProps, ref: React.ForwardedRef<DAffixRef>): JSX.Element | null {
  const { children, dTarget, dTop = 0, dZIndex } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dPageScrollRef, dContentResizeRef } = useLayout();
  //#endregion

  //#region Ref
  const affixRef = useRefExtra(() => document.querySelector(`[data-affix="${uniqueId}"]`));
  const referenceRef = useRefExtra(() => document.querySelector(`[data-affix-reference="${uniqueId}"]`));
  const targetRef = useRefExtra(
    isUndefined(dTarget)
      ? () => dPageScrollRef.current
      : dTarget === false
      ? () => {
          return affixRef.current?.parentElement ?? null;
        }
      : dTarget
  );
  //#endregion

  const uniqueId = useId();

  const [sticky, setSticky] = useState(false);

  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>();
  const updatePosition = useEventCallback(() => {
    const offsetEl = sticky ? referenceRef.current : affixRef.current;

    if (targetRef.current && offsetEl) {
      const offsetRect = offsetEl.getBoundingClientRect();
      const targetTop = getOffsetToRoot(targetRef.current);
      const distance = isString(dTop) ? toPx(dTop, true) : dTop;

      setSticky(targetRef.current.scrollTop + distance >= getOffsetToRoot(offsetEl as HTMLElement) - targetTop);
      setPositionStyle({
        width: offsetRect.width,
        height: offsetRect.height,
        top: (isUndefined(dTarget) ? targetTop : targetRef.current.getBoundingClientRect().top) + distance,
        left: offsetRect.left,
      });
    }
  });
  useIsomorphicLayoutEffect(() => {
    updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const globalScroll = useGlobalScroll(updatePosition);
  useEvent(dPageScrollRef, 'scroll', updatePosition, { passive: true }, globalScroll);
  useEvent(targetRef, 'scroll', updatePosition, { passive: true }, globalScroll || isUndefined(dTarget));

  useResize(sticky ? referenceRef : affixRef, updatePosition);
  useResize(dContentResizeRef, updatePosition);

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
      {sticky &&
        cloneHTMLElement(children, {
          style: {
            ...children.props.style,
            visibility: 'hidden',
          },
          'aria-hidden': true,
          'data-affix-reference': uniqueId,
        })}
      {cloneHTMLElement(children, {
        style: sticky
          ? {
              ...children.props.style,
              ...positionStyle,
              position: 'fixed',
              zIndex: dZIndex ?? `var(--${dPrefix}zindex-sticky)`,
            }
          : children.props.style,
        'data-affix': uniqueId,
      })}
    </>
  );
}

export const DAffix = React.forwardRef(Affix);
