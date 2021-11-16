import type { DElementSelector } from '../../hooks/element';

import { isUndefined } from 'lodash';
import React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useImmer } from 'use-immer';

import { useDComponentConfig, useElement, useId, useThrottle, useAsync, useDPrefixConfig } from '../../hooks';
import { DCollapseTransition } from '../_transition';

export interface DDragProps {
  dPlaceholder?: boolean;
  dContainer?: DElementSelector;
  dZIndex?: number;
  children: React.ReactNode;
}

export function DDrag(props: DDragProps) {
  const { dPlaceholder = false, dContainer, dZIndex = 1000, children } = useDComponentConfig('drag', props);

  const dPrefix = useDPrefixConfig();
  const asyncCapture = useAsync();
  const { throttleByAnimationFrame } = useThrottle();

  //#region Element
  const handleContainer = useCallback(() => {
    if (isUndefined(dContainer)) {
      let el = document.getElementById('d-drag-root');
      if (!el) {
        el = document.createElement('div');
        el.id = 'd-drag-root';
        document.body.appendChild(el);
      }
      return el;
    }
    return null;
  }, [dContainer]);
  const containerEl = useElement(dContainer, handleContainer);
  //#endregion

  const id = useId();

  const [placeholder, setPlaceholder] = useImmer<React.ReactNode>(null);
  const [placeholderVisible, setPlaceholderVisible] = useImmer(true);
  const [position, setPosition] = useImmer<React.CSSProperties>({});

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
      [`data-d-drag-${id}`]: 'true',

      onMouseDown: (e) => {
        _child.props.onMouseDown?.(e);

        onDrag = true;
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition((draft) => {
          if (!placeholder) {
            draft.position = 'fixed';
            draft.zIndex = dZIndex;
            draft.top = rect.top;
            draft.left = rect.left;
            draft.width = rect.width;
            draft.height = rect.height;
          }
          draft.cursor = 'grab';
        });
        setPlaceholderVisible(true);
        if (!placeholder) {
          setPlaceholder(<div className={`${dPrefix}drag-placeholder`} style={{ width: rect.width, height: rect.height }}></div>);
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
    asyncCapture,
    children,
    dPrefix,
    dZIndex,
    id,
    placeholder,
    position,
    setPlaceholder,
    setPlaceholderVisible,
    setPosition,
    throttleByAnimationFrame,
  ]);
  //#endregion

  return (
    <>
      {placeholder
        ? dPlaceholder && (
            <DCollapseTransition dVisible={placeholderVisible} dDirection="height">
              {placeholder}
            </DCollapseTransition>
          )
        : child}
      {placeholder && containerEl.current && ReactDOM.createPortal(child, containerEl.current)}
    </>
  );
}
