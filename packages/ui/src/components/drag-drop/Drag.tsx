import type { DElementSelector } from '../../hooks/element';

import { isNumber, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useImmer } from 'use-immer';

import { useDComponentConfig, useElement, useId, useThrottle, useAsync, useDPrefixConfig, useCustomContext } from '../../hooks';
import { DDropContext } from './Drop';

export interface DDragProps {
  dContainer?: DElementSelector;
  dPlaceholder?: React.ReactNode;
  dZIndex?: number;
  children: React.ReactNode;
  __index?: number;
  __onDragStart?: (index: number) => void;
  __onDrag?: (index: number, center: { top: number; left: number }) => void;
}

export function DDrag(props: DDragProps) {
  const { dContainer, dPlaceholder, dZIndex = 1000, children, __index = 0, __onDragStart, __onDrag } = useDComponentConfig('drag', props);

  const dPrefix = useDPrefixConfig();
  const asyncCapture = useAsync();
  const { throttleByAnimationFrame } = useThrottle();
  const { currentData: _currentData } = useCustomContext(DDropContext);

  const id = useId();

  //#region Element
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
  const dragEl = useElement(`[data-${dPrefix}drag-${id}]`);
  //#endregion

  const [placeholderSize, setPlaceholderSize] = useImmer<React.CSSProperties>({});
  const [dragStyle, setDragStyle] = useImmer<React.CSSProperties>({});
  const [isDrag, setIsDrag] = useImmer(false);

  useEffect(() => {
    _currentData?.els.set(__index, dragEl);
    return () => {
      _currentData?.els.delete(__index);
    };
  }, [__index, _currentData, dragEl, id]);

  //#region React.cloneElement.
  /*
   * @see https://reactjs.org/docs/react-api.html#cloneelement
   *
   * - Vue: Scoped Slots.
   * @see https://v3.vuejs.org/guide/component-slots.html#scoped-slots
   * - Angular: NgTemplateOutlet.
   * @see https://angular.io/api/common/NgTemplateOutlet
   */
  const placeholder = useMemo(() => {
    if (dPlaceholder) {
      const _placeholder = dPlaceholder as React.ReactElement;
      return React.cloneElement(_placeholder, {
        ..._placeholder.props,
        style: {
          ..._placeholder.props.style,
          ...placeholderSize,
        },
      });
    }
  }, [dPlaceholder, placeholderSize]);

  const child = useMemo(() => {
    const _child = React.Children.only(children) as React.ReactElement;
    let onDrag = false;
    const props: React.HTMLAttributes<HTMLElement> = {
      style: {
        ..._child.props.style,
        ...dragStyle,
      },
      [`data-${dPrefix}drag-${id}`]: 'true',

      onMouseDown: (e) => {
        _child.props.onMouseDown?.(e);
        __onDragStart?.(__index);

        onDrag = true;
        setIsDrag(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setPlaceholderSize({ width: rect.width, height: rect.height });
        setDragStyle((draft) => {
          draft.position = 'fixed';
          draft.margin = 0;
          draft.zIndex = dZIndex;
          draft.top = rect.top;
          draft.left = rect.left;
          draft.width = rect.width;
          draft.height = rect.height;
          draft.cursor = 'grab';
        });

        let movementY = 0;
        let movementX = 0;
        const ob = asyncCapture.fromEvent<MouseEvent>(window, 'mousemove').subscribe({
          next: (e) => {
            if (onDrag && (e.movementY !== 0 || e.movementX !== 0)) {
              e.preventDefault();
              movementY += e.movementY;
              movementX += e.movementX;
              throttleByAnimationFrame.run(() => {
                setDragStyle((draft) => {
                  draft.top = (draft.top as number) + movementY;
                  if (draft.top < 0) {
                    draft.top = 0;
                  }
                  if (draft.top > window.innerHeight - rect.height) {
                    draft.top = window.innerHeight - rect.height;
                  }

                  draft.left = (draft.left as number) + movementX;
                  if ((draft.left as number) < 0) {
                    draft.left = 0;
                  }
                  if ((draft.left as number) > window.innerWidth - rect.width) {
                    draft.left = window.innerWidth - rect.width;
                  }

                  draft.cursor = 'grabbing';
                });
                movementY = 0;
                movementX = 0;
              });
            }
          },
        });

        asyncCapture.fromEvent(window, 'mouseup').subscribe({
          next: () => {
            onDrag = false;
            setDragStyle((draft) => {
              draft.cursor = undefined;
            });
            ob.unsubscribe();
          },
        });
      },
    };

    return React.cloneElement(_child, {
      ..._child.props,
      ...props,
    });
  }, [
    __index,
    __onDragStart,
    asyncCapture,
    children,
    dPrefix,
    dZIndex,
    dragStyle,
    id,
    setDragStyle,
    setIsDrag,
    setPlaceholderSize,
    throttleByAnimationFrame,
  ]);
  //#endregion

  useEffect(() => {
    if (isNumber(dragStyle.top) && isNumber(dragStyle.left) && isNumber(dragStyle.height) && isNumber(dragStyle.width))
      __onDrag?.(__index, {
        top: dragStyle.top + dragStyle.height / 2,
        left: dragStyle.left + dragStyle.width / 2,
      });
  }, [__index, __onDrag, id, dragStyle.height, dragStyle.left, dragStyle.top, dragStyle.width]);

  return (
    <>
      {isDrag ? placeholder : child}
      {isDrag && containerEl.current && ReactDOM.createPortal(child, containerEl.current)}
    </>
  );
}
