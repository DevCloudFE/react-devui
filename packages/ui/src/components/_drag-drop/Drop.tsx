import type { DElementSelector } from '../../hooks/element';
import type { Updater } from '../../hooks/two-way-binding';

import { cloneDeep, isEqual, isUndefined } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useMemo } from 'react';

import { useElement, useImmer, useTwoWayBinding } from '../../hooks';
import { DDrag } from './Drag';

export interface DDropContextData {
  gUpdateSelectors: (id: string, drag: string, placeholder: string) => void;
  gRemoveSelectors: (id: string) => void;
  gDirection: 'horizontal' | 'vertical';
  gOuter: boolean;
  gPlaceholder: React.ReactNode;
  gOnDragStart: (id: string) => void;
  gOnDrag: (id: string, rect: { width: number; height: number; top: number; left: number }) => void;
  gOnDragEnd: (id: string) => void;
}
export const DDropContext = React.createContext<DDropContextData | null>(null);

export interface DDropProps<T = unknown> {
  dList: [T[], Updater<T[]>?];
  dItemRender: (item: T, index: number) => React.ReactNode;
  dGetId: (item: T) => string;
  dContainer: DElementSelector;
  dDirection?: 'horizontal' | 'vertical';
  dPlaceholder?: React.ReactNode;
  onListChange?: (list: T[]) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string) => void;
}

export function DDrop<T>(props: DDropProps<T>) {
  const { dList, dItemRender, dGetId, dContainer, dDirection = 'vertical', dPlaceholder, onListChange, onDragStart, onDragEnd } = props;

  const [isOuter, setIsOuter] = useState(false);

  const [drags, setDrags] = useImmer(new Map<string, string>());
  const [placeholders, setPlaceholders] = useImmer(new Map<string, string>());

  const containerEl = useElement(dContainer);

  const [list, changeList] = useTwoWayBinding<T[]>([], dList, onListChange);
  const orderIds = useMemo(() => list.map((item) => dGetId(item)), [dGetId, list]);

  const gUpdateSelectors = useCallback(
    (id, drag, placeholder) => {
      setDrags((draft) => {
        draft.set(id, drag);
      });
      setPlaceholders((draft) => {
        draft.set(id, placeholder);
      });
    },
    [setDrags, setPlaceholders]
  );
  const gRemoveSelectors = useCallback(
    (id) => {
      setDrags((draft) => {
        draft.delete(id);
      });
      setPlaceholders((draft) => {
        draft.delete(id);
      });
    },
    [setDrags, setPlaceholders]
  );
  const gOnDragStart = useCallback(
    (id) => {
      onDragStart?.(id);
    },
    [onDragStart]
  );
  const gOnDrag = useCallback(
    (dragId, rect) => {
      let _isOuter = false;
      if (containerEl) {
        const dropRect = containerEl.getBoundingClientRect();
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

      let newOrderIds = cloneDeep(orderIds);
      newOrderIds.forEach((id, index) => {
        let el: HTMLElement | null = null;
        if (id === dragId) {
          for (const [_id, selector] of placeholders) {
            if (_id === id) {
              el = document.querySelector(selector);
              break;
            }
          }
        } else {
          for (const [_id, selector] of drags.values()) {
            if (_id === id) {
              el = document.querySelector(selector);
              break;
            }
          }
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
        newOrderIds.splice(
          newOrderIds.findIndex((id) => id === dragId),
          1,
          ''
        );

        newOrderIds.splice(replaceIndex, 0, dragId as string);

        newOrderIds = newOrderIds.filter((id) => !!id);
      }

      if (!isEqual(newOrderIds, orderIds)) {
        const newList = [];
        for (const id of newOrderIds) {
          const item = list.find((item) => dGetId(item) === id);
          if (!isUndefined(item)) {
            newList.push(item);
          }
        }
        changeList(newList);
      }
    },
    [changeList, containerEl, dDirection, dGetId, drags, list, orderIds, placeholders]
  );
  const gOnDragEnd = useCallback(
    (id) => {
      onDragEnd?.(id);
    },
    [onDragEnd]
  );
  const contextValue = useMemo<DDropContextData>(
    () => ({
      gUpdateSelectors,
      gRemoveSelectors,
      gDirection: dDirection,
      gOuter: isOuter,
      gPlaceholder: dPlaceholder,
      gOnDragStart,
      gOnDrag,
      gOnDragEnd,
    }),
    [dDirection, dPlaceholder, gOnDrag, gOnDragEnd, gOnDragStart, gRemoveSelectors, gUpdateSelectors, isOuter]
  );

  return (
    <DDropContext.Provider value={contextValue}>
      {list.map((item, index) => (
        <DDrag key={dGetId(item)} dId={dGetId(item)}>
          {dItemRender(item, index)}
        </DDrag>
      ))}
    </DDropContext.Provider>
  );
}
