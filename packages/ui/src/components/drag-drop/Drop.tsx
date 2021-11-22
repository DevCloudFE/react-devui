import type { DElementSelector } from '../../hooks/element';
import type { DDragProps } from './Drag';

import { enableMapSet } from 'immer';
import { isArray, isEqual, isNumber, isUndefined } from 'lodash';
import React, { useState } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import { useImmer, useImmerReducer } from 'use-immer';

import { useDComponentConfig, useElement, useId, useThrottle, useAsync, useDPrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';

export interface DDropContextData {
  dropEl: { current: HTMLElement | null };
  dropCurrentData: {
    drags: Map<string, string>;
    placeholders: Map<string, string>;
    outDrop: boolean;
  };
}
export const DDropContext = React.createContext<DDropContextData | null>(null);

export interface DDropProps extends React.HTMLAttributes<HTMLDivElement> {
  dTag?: string;
  dDirection: 'horizontal' | 'vertical';
  dPlaceholder?: React.ReactNode;
  children: React.ReactNode;
  [index: string]: unknown;
}

export function DDrop(props: DDropProps) {
  const { dTag = 'div', dDirection = 'vertical', dPlaceholder, children, ...restProps } = useDComponentConfig('drop', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  const [currentData] = useState<
    DDropContextData['dropCurrentData'] & {
      order: string[];
      preOrder?: string[];
      dragId?: string;
    }
  >({
    drags: new Map(),
    placeholders: new Map(),
    outDrop: false,
    order: Array<string>(),
  });

  const [updateChildren, setUpdateChildren] = useState(0);
  const id = useId();

  const [orderChildren, setOrderChildren] = useImmer<React.ReactElement[]>([]);

  const dropEl = useElement(`[data-${dPrefix}drop="${id}"]`);

  //#region DidUpdate
  useEffect(() => {
    const _childs = React.Children.toArray(children) as Array<React.ReactElement<DDragProps>>;
    const allIds = _childs.map((child) => child.props.dId as string);
    currentData.order = currentData.order.filter((id) => allIds.includes(id));
    currentData.order.length = allIds.length;
    let addIndex = allIds.findIndex((id) => !currentData.order.includes(id));
    if (addIndex !== -1) {
      const addIds: string[] = [];
      for (; addIndex < allIds.length; addIndex++) {
        if (!currentData.order.includes(allIds[addIndex])) {
          addIds.push(allIds[addIndex]);
        } else {
          break;
        }
      }
      currentData.order.splice(addIndex, 0, ...addIds);
    }

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
          __onDrag: (center) => {
            if (!currentData.outDrop) {
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
                      replaceIndex = quadrant === Quadrant.One || quadrant === Quadrant.Two ? index : index + 1;
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
            }
          },
        });
      })
    );
  }, [children, currentData, dPlaceholder, updateChildren, setOrderChildren]);
  //#endregion

  const contextValue = useMemo<DDropContextData>(
    () => ({
      dropEl,
      dropCurrentData: currentData,
    }),
    [currentData, dropEl]
  );

  return (
    <DDropContext.Provider value={contextValue}>
      {React.createElement(
        dTag,
        {
          ...restProps,
          [`data-${dPrefix}drop`]: String(id),
        },
        [...orderChildren]
      )}
    </DDropContext.Provider>
  );
}
