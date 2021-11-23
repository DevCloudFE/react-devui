import type { DElementSelector } from '../../hooks/element';

import { isNumber, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { flushSync } from 'react-dom';
import { useImmer } from 'use-immer';

import {
  useDComponentConfig,
  useElement,
  useThrottle,
  useAsync,
  useDPrefixConfig,
  useId,
  useCustomContext,
  useDebounce,
} from '../../hooks';
import { DDropContext } from './Drop';

export interface DDragProps {
  dId?: string;
  dContainer?: DElementSelector;
  dPlaceholder?: React.ReactNode;
  dZIndex?: number;
  children: React.ReactNode;
  __onDragStart?: () => void;
  __onDrag?: (center: { top: number; left: number }) => void;
}

export function DDrag(props: DDragProps) {
  const { dId, dContainer, dPlaceholder, dZIndex = 1000, children, __onDragStart, __onDrag } = useDComponentConfig('drag', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const { dropEl, dropCurrentData } = useCustomContext(DDropContext);
  //#endregion

  const asyncCapture = useAsync();
  const { throttleByAnimationFrame } = useThrottle();
  const id = useId();
  const [fixedStyle, setFixedStyle] = useImmer<React.CSSProperties>({});
  const [dragingParams, setDragingParams] = useImmer({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useImmer(false);
  const [showPlaceholder, setShowPlaceholder] = useImmer(false);
  const [fixedDrag, setFixedDrag] = useImmer(false);

  const inDrop = !isUndefined(dropCurrentData);

  const placeholderEl = useElement(`[data-${dPrefix}drag-placeholder="${id}"]`);

  const handleContainer = useCallback(() => {
    if (isUndefined(dContainer)) {
      let el = document.getElementById(`${dPrefix}drag-root`);
      if (!el) {
        el = document.createElement('div');
        el.id = `${dPrefix}drag-root`;
        document.body.appendChild(el);
      }
      return el;
    }
    return null;
  }, [dContainer, dPrefix]);
  const containerEl = useElement(dContainer, handleContainer);

  //#region DidUpdate
  useEffect(() => {
    if (isDragging && isNumber(fixedStyle.top) && isNumber(fixedStyle.left) && isNumber(fixedStyle.height) && isNumber(fixedStyle.width)) {
      __onDrag?.({
        top: fixedStyle.top + fixedStyle.height / 2,
        left: fixedStyle.left + fixedStyle.width / 2,
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
                  if (draft.top > window.innerHeight - dragingParams.height) {
                    draft.top = window.innerHeight - dragingParams.height;
                  }

                  draft.left = (draft.left as number) + movementX;
                  if ((draft.left as number) < 0) {
                    draft.left = 0;
                  }
                  if ((draft.left as number) > window.innerWidth - dragingParams.width) {
                    draft.left = window.innerWidth - dragingParams.width;
                  }

                  let outDrop = false;
                  if (dropEl?.current) {
                    const dropRect = dropEl.current.getBoundingClientRect();
                    if (
                      draft.top + (draft.height as number) < dropRect.top ||
                      draft.top > dropRect.top + dropRect.height ||
                      draft.left + (draft.width as number) < dropRect.left ||
                      draft.left > dropRect.left + dropRect.width
                    ) {
                      outDrop = true;
                    }
                  }
                  if (dropCurrentData) {
                    dropCurrentData.outDrop = outDrop;
                  }

                  draft.cursor = outDrop ? 'not-allowed' : 'grabbing';
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
  }, [asyncCapture, dragingParams, dropCurrentData, dropEl, isDragging, setFixedStyle, throttleByAnimationFrame]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (isDragging) {
      asyncGroup.fromEvent<MouseEvent>(window, 'mouseup').subscribe({
        next: () => {
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
              setFixedStyle({});
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
  }, [
    asyncCapture,
    dragingParams,
    inDrop,
    isDragging,
    placeholderEl,
    setDragingParams,
    setFixedDrag,
    setFixedStyle,
    setIsDragging,
    setShowPlaceholder,
  ]);

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
        ...fixedStyle,
      },

      [`data-${dPrefix}drag`]: String(id),

      onMouseDown: (e) => {
        _child.props.onMouseDown?.(e);
        __onDragStart?.();

        const rect = (e.target as HTMLElement).getBoundingClientRect();

        setDragingParams({
          width: rect.width,
          height: rect.height,
        });

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
    fixedStyle,
    id,
    setDragingParams,
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
          width: dragingParams.width,
          height: dragingParams.height,
        },
        [`data-${dPrefix}drag-placeholder`]: String(id),
      });
    }

    return null;
  }, [dPlaceholder, dPrefix, dragingParams.height, dragingParams.width, id]);

  return (
    <>
      {showPlaceholder && placeholder}
      {fixedDrag ? containerEl.current && ReactDOM.createPortal(child, containerEl.current) : child}
    </>
  );
}
