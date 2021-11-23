import type { DElementSelector } from '../../hooks/element';
import type { DDragProps } from './Drag';

import { isEqual, isUndefined } from 'lodash';
import React, { useImperativeHandle, useState } from 'react';
import { useEffect, useMemo } from 'react';

import { useDComponentConfig, useElement, useAsync, useImmer } from '../../hooks';

export interface DDropContextData {
  dropDirection: 'horizontal' | 'vertical';
  dropOuter: boolean;
  dropCurrentData: {
    drags: Map<string, string>;
    placeholders: Map<string, string>;
  };
}
export const DDropContext = React.createContext<DDropContextData | null>(null);

export type DDropRef = string[];

export interface DDropProps {
  dContainer: DElementSelector;
  dDirection?: 'horizontal' | 'vertical';
  dPlaceholder?: React.ReactNode;
  children: React.ReactNode;
}

export const DDrop = React.forwardRef<DDropRef, DDropProps>((props, ref) => {
  const { dContainer, dDirection = 'vertical', dPlaceholder, children } = useDComponentConfig('drop', props);

  const [currentData] = useState<
    DDropContextData['dropCurrentData'] & {
      order: string[];
      preOrder?: string[];
      dragId?: string;
    }
  >({
    drags: new Map(),
    placeholders: new Map(),
    order: Array<string>(),
  });

  const asyncCapture = useAsync();
  const [updateChildren, setUpdateChildren] = useState(0);
  const [isOuter, setIsOuter] = useState(false);

  const [orderChildren, setOrderChildren] = useImmer<React.ReactElement[]>([]);

  const containerEl = useElement(dContainer);

  //#region DidUpdate
  useEffect(() => {
    const _childs = React.Children.toArray(children) as Array<React.ReactElement<DDragProps>>;
    const allIds = _childs.map((child) => child.props.dId as string);
    currentData.order = currentData.order.filter((id) => allIds.includes(id));
    currentData.order.length = allIds.length;
    const addIndex = allIds.findIndex((id) => !currentData.order.includes(id));
    if (addIndex !== -1) {
      const addIds: string[] = [];
      for (let n = addIndex; n < allIds.length; n++) {
        if (!currentData.order.includes(allIds[n])) {
          addIds.push(allIds[n]);
        } else {
          break;
        }
      }
      currentData.order.splice(addIndex, 0, ...addIds);
    }

    const handleDrag = (rect: { width: number; height: number; top: number; left: number }) => {
      let _isOuter = false;
      const containerCurrentEl = containerEl.current;
      if (containerCurrentEl) {
        const dropRect = containerCurrentEl.getBoundingClientRect();
        if (
          rect.top + rect.height < dropRect.top ||
          rect.top > dropRect.top + dropRect.height ||
          rect.left + rect.width < dropRect.left ||
          rect.left > dropRect.left + dropRect.width
        ) {
          _isOuter = true;
        }
      }
      setIsOuter(_isOuter);

      if (_isOuter) {
        return;
      }

      enum Quadrant {
        One = 1,
        Two,
        Three,
        Four,
      }
      let quadrant: Quadrant | undefined;
      const getQuadrant = (coordinate: { top: number; left: number }, elCoordinate: { top: number; left: number }) => {
        if (coordinate.top < elCoordinate.top && coordinate.left > elCoordinate.left) {
          return Quadrant.One;
        }
        if (coordinate.top < elCoordinate.top && coordinate.left < elCoordinate.left) {
          return Quadrant.Two;
        }
        if (coordinate.top > elCoordinate.top && coordinate.left < elCoordinate.left) {
          return Quadrant.Three;
        }
        if (coordinate.top > elCoordinate.top && coordinate.left > elCoordinate.left) {
          return Quadrant.Four;
        }
      };
      let minDistance: number | undefined;
      let replaceIndex: number | undefined;
      const center = {
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width / 2,
      };
      currentData.order.forEach((id, index) => {
        let el: HTMLElement | null = null;
        if (id === currentData.dragId) {
          const selector = currentData.placeholders.get(id);
          el = selector ? document.querySelector(selector) : null;
        } else {
          const selector = currentData.drags.get(id);
          el = selector ? document.querySelector(selector) : null;
        }
        if (el) {
          const elRect = el.getBoundingClientRect();
          const elCenter = { top: elRect.top + elRect.height / 2, left: elRect.left + elRect.width / 2 };
          const distance = Math.pow(Math.pow(elCenter.top - center.top, 2) + Math.pow(elCenter.left - center.left, 2), 0.5);
          if (isUndefined(minDistance) || distance < minDistance) {
            minDistance = distance;

            if (id !== currentData.dragId) {
              quadrant = getQuadrant(center, elCenter);
              replaceIndex =
                dDirection === 'vertical'
                  ? quadrant === Quadrant.One || quadrant === Quadrant.Two
                    ? index
                    : index + 1
                  : quadrant === Quadrant.Two || quadrant === Quadrant.Three
                  ? index
                  : index + 1;
            }
          }
        }
      });

      if (!isUndefined(replaceIndex)) {
        currentData.order.splice(
          currentData.order.findIndex((id) => id === currentData.dragId),
          1,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          undefined as any
        );

        currentData.order.splice(replaceIndex, 0, currentData.dragId as string);

        currentData.order = currentData.order.filter((id) => !!id);

        if (!isEqual(currentData.preOrder, currentData.order)) {
          currentData.preOrder = [...currentData.order];
          setUpdateChildren((prev) => prev + 1);
        }
      }
    };

    setOrderChildren(
      currentData.order.map((id) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const node = _childs.find((child) => child.props.dId === id)!;

        return React.cloneElement<DDragProps>(node, {
          ...node.props,
          dPlaceholder: dPlaceholder,
          __onDragStart: () => {
            currentData.dragId = node.props.dId;
          },
          __onDrag: (rect) => {
            handleDrag(rect);
          },
        });
      })
    );
  }, [children, currentData, dPlaceholder, updateChildren, setOrderChildren, dDirection, containerEl, asyncCapture]);
  //#endregion

  const contextValue = useMemo<DDropContextData>(
    () => ({
      dropDirection: dDirection,
      dropOuter: isOuter,
      dropCurrentData: currentData,
    }),
    [dDirection, isOuter, currentData]
  );

  useImperativeHandle(ref, () => currentData.order, [currentData.order]);

  return <DDropContext.Provider value={contextValue}>{orderChildren}</DDropContext.Provider>;
});
