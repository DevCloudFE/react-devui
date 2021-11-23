import { isNumber, isUndefined } from 'lodash';
import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { flushSync } from 'react-dom';
import { useImmer } from 'use-immer';

import { useDComponentConfig, useElement, useThrottle, useAsync, useDPrefixConfig, useId, useCustomContext } from '../../hooks';
import { DDropContext } from './Drop';

export interface DDragProps {
  dId?: string;
  dPlaceholder?: React.ReactNode;
  dZIndex?: number;
  children: React.ReactNode;
  __onDragStart?: () => void;
  __onDrag?: (rect: { width: number; height: number; top: number; left: number }) => void;
  __onDragEnd?: () => void;
}

export function DDrag(props: DDragProps) {
  const { dId, dPlaceholder, dZIndex = 1000, children, __onDragStart, __onDrag, __onDragEnd } = useDComponentConfig('drag', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const { dropEl, dropOuter, dropCurrentData } = useCustomContext(DDropContext);
  //#endregion

  const asyncCapture = useAsync();
  const { throttleByAnimationFrame } = useThrottle();
  const id = useId();
  const [fixedStyle, setFixedStyle] = useImmer<
    React.CSSProperties & {
      width: number;
      height: number;
    }
  >({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useImmer(false);
  const [showPlaceholder, setShowPlaceholder] = useImmer(false);
  const [fixedDrag, setFixedDrag] = useImmer(false);

  const inDrop = !isUndefined(dropCurrentData);

  const placeholderEl = useElement(`[data-${dPrefix}drag-placeholder="${id}"]`);

  const [containerEl] = useImmer(() => {
    let el = document.getElementById(`${dPrefix}drag-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}drag-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  //#region DidUpdate
  useEffect(() => {
    if (isDragging && isNumber(fixedStyle.top) && isNumber(fixedStyle.left) && isNumber(fixedStyle.height) && isNumber(fixedStyle.width)) {
      __onDrag?.({
        width: fixedStyle.width,
        height: fixedStyle.height,
        top: fixedStyle.top,
        left: fixedStyle.left,
      });
    }
  }, [__onDrag, fixedStyle.height, fixedStyle.left, fixedStyle.top, fixedStyle.width, isDragging]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (isDragging) {
      let movementY = 0;
      let movementX = 0;

      asyncGroup.fromEvent<MouseEvent>(window, 'mousemove').subscribe({
        next: (e) => {
          e.preventDefault();

          if (e.movementY !== 0 || e.movementX !== 0) {
            movementY += e.movementY / window.devicePixelRatio;
            movementX += e.movementX / window.devicePixelRatio;
            throttleByAnimationFrame.run(() => {
              flushSync(() => {
                setFixedStyle((draft) => {
                  draft.top = (draft.top as number) + movementY;
                  if (draft.top < 0) {
                    draft.top = 0;
                  }
                  if (draft.top > window.innerHeight - fixedStyle.height) {
                    draft.top = window.innerHeight - fixedStyle.height;
                  }

                  draft.left = (draft.left as number) + movementX;
                  if ((draft.left as number) < 0) {
                    draft.left = 0;
                  }
                  if ((draft.left as number) > window.innerWidth - fixedStyle.width) {
                    draft.left = window.innerWidth - fixedStyle.width;
                  }

                  draft.cursor = dropOuter ? 'not-allowed' : 'grabbing';
                });
              });
              movementY = 0;
              movementX = 0;
            });
          }
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [
    asyncCapture,
    dropCurrentData,
    dropEl,
    dropOuter,
    fixedStyle.height,
    fixedStyle.width,
    isDragging,
    setFixedStyle,
    throttleByAnimationFrame,
  ]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (isDragging) {
      asyncGroup.fromEvent<MouseEvent>(window, 'mouseup').subscribe({
        next: () => {
          __onDragEnd?.();
          setIsDragging(false);
          if (inDrop) {
            setFixedStyle((draft) => {
              const rect = placeholderEl.current?.getBoundingClientRect();
              if (rect) {
                draft.top = rect.top;
                draft.left = rect.left;
                draft.transition = 'all 0.1s linear';
                draft.cursor = undefined;
              }
            });

            asyncCapture.setTimeout(() => {
              setFixedStyle({ width: 0, height: 0 });
              setFixedDrag(false);
              setShowPlaceholder(false);
            }, 100 + 10);
          } else {
            setFixedStyle((draft) => {
              draft.cursor = undefined;
            });
          }
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [__onDragEnd, asyncCapture, inDrop, isDragging, placeholderEl, setFixedDrag, setFixedStyle, setIsDragging, setShowPlaceholder]);

  useEffect(() => {
    if (dId) {
      dropCurrentData?.drags.set(dId, `[data-${dPrefix}drag="${id}"]`);
      dropCurrentData?.placeholders.set(dId, `[data-${dPrefix}drag-placeholder="${id}"]`);
      return () => {
        dropCurrentData?.drags.delete(dId);
        dropCurrentData?.placeholders.delete(dId);
      };
    }
  }, [dId, dPrefix, dropCurrentData, id]);
  //#endregion

  const child = useMemo(() => {
    const _child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;

    return React.cloneElement<React.HTMLAttributes<HTMLElement>>(_child, {
      ..._child.props,

      style: {
        ..._child.props.style,
        ...(fixedDrag ? fixedStyle : undefined),
      },

      [`data-${dPrefix}drag`]: String(id),

      onMouseDown: (e) => {
        _child.props.onMouseDown?.(e);
        __onDragStart?.();

        const rect = (e.target as HTMLElement).getBoundingClientRect();

        setFixedStyle({
          position: 'fixed',
          margin: 0,
          zIndex: dZIndex,
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          cursor: 'grab',
        });

        setShowPlaceholder(true);
        setFixedDrag(true);
        setIsDragging(true);
      },
    });
  }, [
    __onDragStart,
    children,
    dPrefix,
    dZIndex,
    fixedDrag,
    fixedStyle,
    id,
    setFixedDrag,
    setFixedStyle,
    setIsDragging,
    setShowPlaceholder,
  ]);

  const placeholder = useMemo(() => {
    if (dPlaceholder) {
      const _placeholder = dPlaceholder as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
      return React.cloneElement<React.HTMLAttributes<HTMLElement>>(_placeholder, {
        ..._placeholder.props,
        style: {
          ..._placeholder.props.style,
          width: fixedStyle.width,
          height: fixedStyle.height,
        },
        [`data-${dPrefix}drag-placeholder`]: String(id),
      });
    }

    return null;
  }, [dPlaceholder, dPrefix, fixedStyle.height, fixedStyle.width, id]);

  return (
    <>
      {showPlaceholder && placeholder}
      {fixedDrag ? ReactDOM.createPortal(child, containerEl) : child}
    </>
  );
}
