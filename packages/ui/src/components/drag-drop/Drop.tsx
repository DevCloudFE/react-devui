import type { DElementSelector } from '../../hooks/element-ref';
import type { DDragProps } from './Drag';

import { cloneDeep, isEqual, isUndefined } from 'lodash';
import React, { useImperativeHandle, useState } from 'react';
import { useEffect, useMemo } from 'react';

import { useComponentConfig, useRefSelector, useImmer } from '../../hooks';

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

export type DDropRef = string[];

export interface DDropProps {
  dContainer: DElementSelector;
  dDirection?: 'horizontal' | 'vertical';
  dPlaceholder?: React.ReactNode;
  children: React.ReactNode;
  onOrderChange?: (order: string[]) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string) => void;
}

const Drop: React.ForwardRefRenderFunction<DDropRef, DDropProps> = (props, ref) => {
  const {
    dContainer,
    dDirection = 'vertical',
    dPlaceholder,
    children,
    onOrderChange,
    onDragStart,
    onDragEnd,
  } = useComponentConfig(DDrop.name, props);

  const [isOuter, setIsOuter] = useState(false);
  const [dragEnd, setDragEnd] = useState(false);

  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [orderChildren, setOrderChildren] = useImmer<React.ReactElement[]>([]);

  const [drags, setDrags] = useImmer(new Map<string, { id: string; selector: string }>());
  const [placeholders, setPlaceholders] = useImmer(new Map<string, { id: string; selector: string }>());

  const containerRef = useRefSelector(dContainer);

  //#region DidUpdate
  useEffect(() => {
    if (dragEnd) {
      onOrderChange?.(orderIds);
    }
  }, [dragEnd, onOrderChange, orderIds]);

  useEffect(() => {
    const _childs = React.Children.toArray(children) as Array<React.ReactElement<DDragProps>>;
    const allIds = _childs.map((child) => child.props.dId as string);
    const newOrderIds = cloneDeep(orderIds.filter((id) => allIds.includes(id)));
    const addIndex = allIds.findIndex((id) => !newOrderIds.includes(id));
    if (addIndex !== -1) {
      const addIds: string[] = [];
      for (let n = addIndex; n < allIds.length; n++) {
        if (!newOrderIds.includes(allIds[n])) {
          addIds.push(allIds[n]);
        } else {
          break;
        }
      }
      newOrderIds.splice(addIndex, 0, ...addIds);
    }

    if (!isEqual(newOrderIds, orderIds)) {
      setOrderIds(newOrderIds);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setOrderChildren(newOrderIds.map((id) => _childs.find((child) => child.props.dId === id)!));
  }, [children, setOrderChildren, orderIds, setOrderIds]);
  //#endregion

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
        setDragEnd(false);
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
          setOrderIds(newOrderIds);
        }
      },
      onDragEnd: (id) => {
        setDragEnd(true);
        onDragEnd?.(id);
      },
    }),
    [containerRef, dDirection, dPlaceholder, drags, isOuter, onDragEnd, onDragStart, orderIds, placeholders, stateBackflow]
  );

  useImperativeHandle(ref, () => orderIds, [orderIds]);

  return <DDropContext.Provider value={contextValue}>{orderChildren}</DDropContext.Provider>;
};

export const DDrop = React.forwardRef(Drop);
