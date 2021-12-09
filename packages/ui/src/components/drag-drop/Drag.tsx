import { isNumber } from 'lodash';
import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

import { useComponentConfig, useRefSelector, useThrottle, useAsync, usePrefixConfig, useId, useCustomContext, useImmer } from '../../hooks';
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
  const [{ dropOuter, dropCurrentData, dropPlaceholder, onDragStart: _onDragStart, onDrag: _onDrag, onDragEnd: _onDragEnd }, dropContext] =
    useCustomContext(DDropContext);
  //#endregion

  const asyncCapture = useAsync();
  const { throttleByAnimationFrame } = useThrottle();
  const id = useId();
  const [dragSize, setDragSize] = useImmer<{ width: number; height: number }>({ width: 0, height: 0 });
  const [fixedStyle, setFixedStyle] = useImmer<React.CSSProperties>({});
  const [isDragging, setIsDragging] = useImmer(false);
  const [showPlaceholder, setShowPlaceholder] = useImmer(false);
  const [fixedDrag, setFixedDrag] = useImmer(false);

  const inDrop = dropContext !== null;

  const placeholderRef = useRefSelector(`[data-${dPrefix}drag-placeholder="${id}"]`);

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

    if (isDragging) {
      let movementY = 0;
      let movementX = 0;

      asyncGroup.fromEvent<MouseEvent>(window, 'mousemove', { capture: true }).subscribe({
        next: (e) => {
          e.preventDefault();

          movementY += e.movementY / window.devicePixelRatio;
          movementX += e.movementX / window.devicePixelRatio;

          throttleByAnimationFrame.run(() => {
            ((movementY, movementX) => {
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
            })(movementY, movementX);

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

    if (isDragging) {
      asyncGroup.fromEvent<MouseEvent>(window, 'mouseup', { capture: true }).subscribe({
        next: () => {
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

      draggable: true,

      [`data-${dPrefix}drag`]: String(id),

      onDragStart: (e) => {
        e.preventDefault();

        _child.props.onDragStart?.(e);
        onDragStart?.();
        if (dId) {
          _onDragStart?.(dId);
        }

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const dragStyle = getComputedStyle(e.currentTarget);

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
    id,
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
        [`data-${dPrefix}drag-placeholder`]: String(id),
      });
    }

    return null;
  }, [dPlaceholder, dPrefix, dragSize.height, dragSize.width, dropPlaceholder, id]);

  return (
    <>
      {showPlaceholder && placeholder}
      {fixedDrag ? ReactDOM.createPortal(child, containerEl) : child}
    </>
  );
}
