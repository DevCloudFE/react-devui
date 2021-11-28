import type { DElementSelector } from '../../hooks/element-ref';
import type { DDragProps } from './Drag';

import { isEqual, isUndefined } from 'lodash';
import React, { useImperativeHandle, useRef } from 'react';
import { useEffect, useMemo } from 'react';

import { useDComponentConfig, useRefSelector, useImmer } from '../../hooks';

export interface DDropContextData {
  dropDirection: 'horizontal' | 'vertical';
  dropOuter: boolean;
  dropCurrentData: {
    drags: Map<string, string>;
    placeholders: Map<string, string>;
  };
  dropPlaceholder: React.ReactNode;
  onDragStart: (id: string) => void;
  onDrag: (id: string, rect: { width: number; height: number; top: number; left: number }) => void;
  onDragEnd: (id: string) => void;
}
export const DDropContext = React.createContext<DDropContextData | null>(null);

export type DDropRef = string[];

export interface DDropProps {
  dContainer: DElementSelector;
  dDirection?: 'horizontal' | 'vertical';
  dPlaceholder?: React.ReactNode;
  children: React.ReactNode;
  onOrderChange?: (order: string[]) => void;
  onDragStart?: (id: string) => void;
  onDrag?: (id: string) => void;
  onDragEnd?: (id: string) => void;
}

export const DDrop = React.forwardRef<DDropRef, DDropProps>((props, ref) => {
  const {
    dContainer,
    dDirection = 'vertical',
    dPlaceholder,
    children,
    onOrderChange,
    onDragStart,
    onDrag,
    onDragEnd,
  } = useDComponentConfig('drop', props);

  const dataRef = useRef<
    DDropContextData['dropCurrentData'] & {
      order: string[];
      preOrder?: string[];
    }
  >({
    drags: new Map(),
    placeholders: new Map(),
    order: Array<string>(),
  });

  const [updateChildren, setUpdateChildren] = useImmer(0);
  const [isOuter, setIsOuter] = useImmer(false);

  const [orderChildren, setOrderChildren] = useImmer<React.ReactElement[]>([]);

  const containerRef = useRefSelector(dContainer);

  //#region DidUpdate
  useEffect(() => {
    const _childs = React.Children.toArray(children) as Array<React.ReactElement<DDragProps>>;
    const allIds = _childs.map((child) => child.props.dId as string);
    dataRef.current.order = dataRef.current.order.filter((id) => allIds.includes(id));
    dataRef.current.order.length = allIds.length;
    const addIndex = allIds.findIndex((id) => !dataRef.current.order.includes(id));
    if (addIndex !== -1) {
      const addIds: string[] = [];
      for (let n = addIndex; n < allIds.length; n++) {
        if (!dataRef.current.order.includes(allIds[n])) {
          addIds.push(allIds[n]);
        } else {
          break;
        }
      }
      dataRef.current.order.splice(addIndex, 0, ...addIds);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setOrderChildren(dataRef.current.order.map((id) => _childs.find((child) => child.props.dId === id)!));
  }, [children, updateChildren, setOrderChildren]);
  //#endregion

  const contextValue = useMemo<DDropContextData>(
    () => ({
      dropDirection: dDirection,
      dropOuter: isOuter,
      dropCurrentData: dataRef.current,
      dropPlaceholder: dPlaceholder,
      onDragStart: (id) => {
        onDragStart?.(id);
      },
      onDrag: (dragId, rect) => {
        onDrag?.(dragId);
        let _isOuter = false;
        const containerCurrentEl = containerRef.current;
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
        dataRef.current.order.forEach((id, index) => {
          let el: HTMLElement | null = null;
          if (id === dragId) {
            const selector = dataRef.current.placeholders.get(id);
            el = selector ? document.querySelector(selector) : null;
          } else {
            const selector = dataRef.current.drags.get(id);
            el = selector ? document.querySelector(selector) : null;
          }
          if (el) {
            const elRect = el.getBoundingClientRect();
            const elCenter = { top: elRect.top + elRect.height / 2, left: elRect.left + elRect.width / 2 };
            const distance = Math.pow(Math.pow(elCenter.top - center.top, 2) + Math.pow(elCenter.left - center.left, 2), 0.5);
            if (isUndefined(minDistance) || distance < minDistance) {
              minDistance = distance;

              if (id !== dragId) {
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
          dataRef.current.order.splice(
            dataRef.current.order.findIndex((id) => id === dragId),
            1,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            undefined as any
          );

          dataRef.current.order.splice(replaceIndex, 0, dragId as string);

          dataRef.current.order = dataRef.current.order.filter((id) => !!id);

          if (!isEqual(dataRef.current.preOrder, dataRef.current.order)) {
            dataRef.current.preOrder = [...dataRef.current.order];
            setUpdateChildren((prev) => prev + 1);
            onOrderChange?.(dataRef.current.order);
          }
        }
      },
      onDragEnd: (id) => {
        onDragEnd?.(id);
      },
    }),
    [dDirection, isOuter, dPlaceholder, onDragStart, onDrag, containerRef, setIsOuter, setUpdateChildren, onOrderChange, onDragEnd]
  );

  useImperativeHandle(ref, () => dataRef.current.order, []);

  return <DDropContext.Provider value={contextValue}>{orderChildren}</DDropContext.Provider>;
});
