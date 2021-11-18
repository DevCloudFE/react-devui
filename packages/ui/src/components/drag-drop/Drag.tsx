import type { DElementSelector } from '../../hooks/element';

import { isNumber, isUndefined } from 'lodash';
import React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useImmer } from 'use-immer';

import { useDComponentConfig, useElement, useId, useThrottle, useAsync, useDPrefixConfig, useCustomContext } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { DDropContext } from './Drop';

export interface DDragProps {
  dPlaceholder?: boolean;
  dContainer?: DElementSelector;
  dZIndex?: number;
  dPlaceholderClass?: string;
  dPlaceholderStyle?: React.CSSProperties;
  children: React.ReactNode;
  __index?: number;
  __onDragStart?: (id: number, placeholder: React.ReactNode) => void;
  __onDrag?: (id: number, center: { top: number; left: number }) => void;
}

export function DDrag(props: DDragProps) {
  const {
    dPlaceholder = false,
    dContainer,
    dZIndex = 1000,
    dPlaceholderClass,
    dPlaceholderStyle,
    children,
    __index = 0,
    __onDragStart,
    __onDrag,
  } = useDComponentConfig('drag', props);

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

  const [placeholder, setPlaceholder] = useImmer<React.ReactNode>(null);
  const [placeholderVisible, setPlaceholderVisible] = useImmer(false);
  const [position, setPosition] = useImmer<React.CSSProperties>({});

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
  const child = useMemo(() => {
    const _child = React.Children.only(children) as React.ReactElement;
    let onDrag = false;
    const props: React.HTMLAttributes<HTMLElement> = {
      style: {
        ..._child.props.style,
        ...position,
      },
      [`data-${dPrefix}drag-${id}`]: 'true',

      onMouseDown: (e) => {
        _child.props.onMouseDown?.(e);

        onDrag = true;
        const rect = e.currentTarget.getBoundingClientRect();
        const placeholderNode = (
          <div
            className={getClassName(dPlaceholderClass, `${dPrefix}drag-placeholder`)}
            style={{ ...dPlaceholderStyle, width: rect.width, height: rect.height }}
          ></div>
        );
        __onDragStart?.(__index, placeholderNode);

        setPosition((draft) => {
          draft.position = 'fixed';
          draft.zIndex = dZIndex;
          draft.top = rect.top;
          draft.left = rect.left;
          draft.width = rect.width;
          draft.height = rect.height;
          draft.cursor = 'grab';
        });
        if (dPlaceholder) {
          setPlaceholderVisible(true);
          setPlaceholder(placeholderNode);
        }

        let movementY = 0;
        let movementX = 0;
        const ob = asyncCapture.fromEvent<MouseEvent>(window, 'mousemove').subscribe({
          next: (e) => {
            if (onDrag && (e.movementY !== 0 || e.movementX !== 0)) {
              e.preventDefault();
              movementY += e.movementY;
              movementX += e.movementX;
              throttleByAnimationFrame(() => {
                setPosition((draft) => {
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
            setPosition((draft) => {
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
    dPlaceholder,
    dPlaceholderClass,
    dPlaceholderStyle,
    dPrefix,
    dZIndex,
    id,
    position,
    setPlaceholder,
    setPlaceholderVisible,
    setPosition,
    throttleByAnimationFrame,
  ]);
  //#endregion

  useEffect(() => {
    if (isNumber(position.top) && isNumber(position.left) && isNumber(position.height) && isNumber(position.width))
      __onDrag?.(__index, {
        top: position.top + position.height / 2,
        left: position.left + position.width / 2,
      });
  }, [__index, __onDrag, id, position.height, position.left, position.top, position.width]);

  return (
    <>
      {dPlaceholder && placeholder && (
        <DCollapseTransition dVisible={placeholderVisible} dDirection="height">
          {placeholder}
        </DCollapseTransition>
      )}
      {child}
    </>
  );
}
