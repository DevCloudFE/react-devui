import { isNumber, isUndefined } from 'lodash';
import React, { useId, useEffect, useMemo, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { merge } from 'rxjs';

import {
  useComponentConfig,
  useRefSelector,
  useThrottle,
  useAsync,
  usePrefixConfig,
  useCustomContext,
  useImmer,
  useStateBackflow,
} from '../../hooks';
import { DDropContext } from './Drop';

export interface DDragProps {
  dId?: string;
  dPlaceholder?: React.ReactNode;
  dZIndex?: number;
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function DDrag(props: DDragProps) {
  const { dId, dPlaceholder, dZIndex = 1000, children, onDragStart, onDragEnd } = useComponentConfig(DDrag.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [
    { updateSelectors, removeSelectors, dropOuter, dropPlaceholder, onDragStart: _onDragStart, onDrag: _onDrag, onDragEnd: _onDragEnd },
    dropContext,
  ] = useCustomContext(DDropContext);
  //#endregion

  const dataRef = useRef<{ dragEl: HTMLElement | null }>({
    dragEl: null,
  });

  const asyncCapture = useAsync();
  const { throttleByAnimationFrame } = useThrottle();
  const uniqueId = useId();
  const [dragSize, setDragSize] = useImmer<{ width: number; height: number }>({ width: 0, height: 0 });
  const [fixedStyle, setFixedStyle] = useImmer<React.CSSProperties>({});
  const [isDragging, setIsDragging] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [fixedDrag, setFixedDrag] = useState(false);

  const inDrop = dropContext !== null;

  const placeholderRef = useRefSelector(`[data-${dPrefix}drag-placeholder="${uniqueId}"]`);

  const [containerEl] = useState(() => {
    let el = document.getElementById(`${dPrefix}drag-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}drag-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  useStateBackflow(
    updateSelectors,
    removeSelectors,
    dId as string,
    `[data-${dPrefix}drag="${uniqueId}"]`,
    `[data-${dPrefix}drag-placeholder="${uniqueId}"]`
  );

  //#region DidUpdate
  useEffect(() => {
    if (isDragging && isNumber(fixedStyle.top) && isNumber(fixedStyle.left)) {
      if (dId) {
        _onDrag?.(dId, {
          width: dragSize.width,
          height: dragSize.height,
          top: fixedStyle.top,
          left: fixedStyle.left,
        });
      }
    }
  }, [_onDrag, dId, dragSize.height, dragSize.width, fixedStyle.left, fixedStyle.top, isDragging]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (isDragging && dataRef.current.dragEl) {
      let clientY: number | undefined;
      let clientX: number | undefined;
      let movementY = 0;
      let movementX = 0;

      const handleMove = (movementY: number, movementX: number) => {
        setFixedStyle((draft) => {
          draft.top = (draft.top as number) + movementY;
          if (draft.top < 0) {
            draft.top = 0;
          }
          if (draft.top > window.innerHeight - dragSize.height) {
            draft.top = window.innerHeight - dragSize.height;
          }

          draft.left = (draft.left as number) + movementX;
          if (draft.left < 0) {
            draft.left = 0;
          }
          if (draft.left > window.innerWidth - dragSize.width) {
            draft.left = window.innerWidth - dragSize.width;
          }

          draft.cursor = dropOuter ? 'not-allowed' : 'grabbing';
        });
      };

      asyncGroup.fromEvent<TouchEvent>(window, 'touchmove', { capture: true, passive: false }).subscribe({
        next: (e) => {
          e.preventDefault();
        },
      });
      asyncGroup.fromEvent<TouchEvent>(dataRef.current.dragEl, 'touchmove', { capture: true, passive: false }).subscribe({
        next: (e) => {
          e.preventDefault();

          if (isUndefined(clientY) || isUndefined(clientX)) {
            clientY = e.touches[0].clientY;
            clientX = e.touches[0].clientX;
          } else {
            movementY += e.touches[0].clientY - clientY;
            movementX += e.touches[0].clientX - clientX;
            clientY = e.touches[0].clientY;
            clientX = e.touches[0].clientX;
          }
          throttleByAnimationFrame.run(() => {
            handleMove(movementY, movementX);

            movementY = 0;
            movementX = 0;
          });
        },
      });

      asyncGroup.fromEvent<MouseEvent>(window, 'mousemove', { capture: true }).subscribe({
        next: (e) => {
          e.preventDefault();

          movementY += e.movementY / window.devicePixelRatio;
          movementX += e.movementX / window.devicePixelRatio;

          throttleByAnimationFrame.run(() => {
            handleMove(movementY, movementX);

            movementY = 0;
            movementX = 0;
          });
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, dragSize.height, dragSize.width, dropOuter, isDragging, setFixedStyle, throttleByAnimationFrame]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (isDragging && dataRef.current.dragEl) {
      merge(
        asyncGroup.fromEvent<MouseEvent>(window, 'mouseup', { capture: true }),
        asyncGroup.fromEvent<MouseEvent>(dataRef.current.dragEl, 'touchend', { capture: true })
      ).subscribe({
        next: (e) => {
          e.preventDefault();

          setIsDragging(false);
          if (inDrop) {
            setFixedStyle((draft) => {
              const rect = placeholderRef.current?.getBoundingClientRect();
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
              if (dId) {
                _onDragEnd?.(dId);
              }
              onDragEnd?.();
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
    inDrop,
    isDragging,
    _onDragEnd,
    placeholderRef,
    setFixedDrag,
    setFixedStyle,
    setIsDragging,
    setShowPlaceholder,
    onDragEnd,
    dId,
  ]);
  //#endregion

  const child = useMemo(() => {
    const _child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;

    return React.cloneElement<React.HTMLAttributes<HTMLElement>>(_child, {
      ..._child.props,

      style: {
        ..._child.props.style,
        ...(fixedDrag ? fixedStyle : undefined),
      },

      draggable: true,

      [`data-${dPrefix}drag`]: uniqueId,

      onDragStart: (e) => {
        e.preventDefault();
        _child.props.onDragStart?.(e);

        onDragStart?.();
        if (dId) {
          _onDragStart?.(dId);
        }

        const currentTarget = e.currentTarget as HTMLElement;
        dataRef.current.dragEl = currentTarget;
        const rect = currentTarget.getBoundingClientRect();
        const dragStyle = getComputedStyle(currentTarget);

        setDragSize({
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
          paddingTop: dragStyle.paddingTop,
          paddingRight: dragStyle.paddingRight,
          paddingBottom: dragStyle.paddingBottom,
          paddingLeft: dragStyle.paddingLeft,
          borderTopWidth: dragStyle.borderTopWidth,
          borderRightWidth: dragStyle.borderRightWidth,
          borderBottomWidth: dragStyle.borderBottomWidth,
          borderLeftWidth: dragStyle.borderLeftWidth,
        });

        setShowPlaceholder(true);
        setFixedDrag(true);
        setIsDragging(true);
      },
    });
  }, [
    children,
    fixedDrag,
    fixedStyle,
    dPrefix,
    uniqueId,
    onDragStart,
    dId,
    setDragSize,
    setFixedStyle,
    dZIndex,
    setShowPlaceholder,
    setFixedDrag,
    setIsDragging,
    _onDragStart,
  ]);

  const placeholder = useMemo(() => {
    const _placeholder = (dropPlaceholder ?? dPlaceholder) as React.ReactElement<React.HTMLAttributes<HTMLElement>> | undefined;

    if (_placeholder) {
      return React.cloneElement<React.HTMLAttributes<HTMLElement>>(_placeholder, {
        ..._placeholder.props,
        style: {
          ..._placeholder.props.style,
          width: dragSize.width,
          height: dragSize.height,
        },
        [`data-${dPrefix}drag-placeholder`]: uniqueId,
      });
    }

    return null;
  }, [dPlaceholder, dPrefix, dragSize.height, dragSize.width, dropPlaceholder, uniqueId]);

  return (
    <>
      {showPlaceholder && placeholder}
      {fixedDrag ? ReactDOM.createPortal(child, containerEl) : child}
    </>
  );
}
