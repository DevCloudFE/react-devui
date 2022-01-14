import type { DElementSelector } from '../../hooks/element-ref';
import type { Updater } from '../../hooks/two-way-binding';

import { cloneDeep, isEqual, isUndefined } from 'lodash';
import React, { useState } from 'react';
import { useMemo } from 'react';

import { useComponentConfig, useRefSelector, useImmer, useTwoWayBinding } from '../../hooks';
import { generateComponentMate } from '../../utils';
import { DDrag } from './Drag';

export interface DDropContextData {
  updateSelectors: (identity: string, id: string, drag: string, placeholder: string) => void;
  removeSelectors: (identity: string) => void;
  dropDirection: 'horizontal' | 'vertical';
  dropOuter: boolean;
  dropPlaceholder: React.ReactNode;
  onDragStart: (id: string) => void;
  onDrag: (id: string, rect: { width: number; height: number; top: number; left: number }) => void;
  onDragEnd: (id: string) => void;
}
export const DDropContext = React.createContext<DDropContextData | null>(null);

export interface DDropProps<T> {
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

const { COMPONENT_NAME } = generateComponentMate('DDrop');
export function DDrop<T>(props: DDropProps<T>) {
  const {
    dList,
    dItemRender,
    dGetId,
    dContainer,
    dDirection = 'vertical',
    dPlaceholder,
    onListChange,
    onDragStart,
    onDragEnd,
  } = useComponentConfig(COMPONENT_NAME, props);

  const [isOuter, setIsOuter] = useState(false);

  const [drags, setDrags] = useImmer(new Map<string, { id: string; selector: string }>());
  const [placeholders, setPlaceholders] = useImmer(new Map<string, { id: string; selector: string }>());

  const containerRef = useRefSelector(dContainer);

  const [list, changeList] = useTwoWayBinding([], dList, onListChange);
  const orderIds = useMemo(() => list.map((item) => dGetId(item)), [dGetId, list]);

  const stateBackflow = useMemo<Pick<DDropContextData, 'updateSelectors' | 'removeSelectors'>>(
    () => ({
      updateSelectors: (identity, id, drag, placeholder) => {
        setDrags((draft) => {
          draft.set(identity, { id, selector: drag });
        });
        setPlaceholders((draft) => {
          draft.set(identity, { id, selector: placeholder });
        });
      },
      removeSelectors: (identity) => {
        setDrags((draft) => {
          draft.delete(identity);
        });
        setPlaceholders((draft) => {
          draft.delete(identity);
        });
      },
    }),
    [setDrags, setPlaceholders]
  );
  const contextValue = useMemo<DDropContextData>(
    () => ({
      ...stateBackflow,
      dropDirection: dDirection,
      dropOuter: isOuter,
      dropPlaceholder: dPlaceholder,
      onDragStart: (id) => {
        onDragStart?.(id);
      },
      onDrag: (dragId, rect) => {
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

        let newOrderIds = cloneDeep(orderIds);
        newOrderIds.forEach((id, index) => {
          let el: HTMLElement | null = null;
          if (id === dragId) {
            for (const { id: _id, selector } of placeholders.values()) {
              if (_id === id) {
                el = document.querySelector(selector);
                break;
              }
            }
          } else {
            for (const { id: _id, selector } of drags.values()) {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            undefined as any
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
      onDragEnd: (id) => {
        onDragEnd?.(id);
      },
    }),
    [
      changeList,
      containerRef,
      dDirection,
      dGetId,
      dPlaceholder,
      drags,
      isOuter,
      list,
      onDragEnd,
      onDragStart,
      orderIds,
      placeholders,
      stateBackflow,
    ]
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
