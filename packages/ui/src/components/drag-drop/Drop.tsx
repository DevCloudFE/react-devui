import type { DElementSelector } from '../../hooks/element';

import { enableMapSet } from 'immer';
import { isArray, isNumber, isUndefined } from 'lodash';
import React, { useState } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import { useImmer, useImmerReducer } from 'use-immer';

import { useDComponentConfig, useElement, useId, useThrottle, useAsync, useDPrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';

export type DDropContextData = {
  currentData: {
    els: Map<number, { current: HTMLElement | null }>;
  };
} | null;
export const DDropContext = React.createContext<DDropContextData>(null);

export interface DDropProps extends React.HTMLAttributes<HTMLDivElement> {
  dTag?: string;
  dDirection: 'horizontal' | 'vertical';
  dPlaceholderClass?: string;
  dPlaceholderStyle?: React.CSSProperties;
  children: React.ReactNode;
  [index: string]: unknown;
}

export function DDrop(props: DDropProps) {
  const {
    dTag = 'div',
    dDirection = 'vertical',
    dPlaceholderClass,
    dPlaceholderStyle,
    children,
    ...restProps
  } = useDComponentConfig('drop', props);

  const dPrefix = useDPrefixConfig();

  const [currentData] = useState<NonNullable<DDropContextData>['currentData']>({
    els: new Map(),
  });

  const id = useId();

  const dropPlaceholderEl = useElement(`[data-${dPrefix}drop-placeholder-${id}]`);

  const [orderChildren, dispatchOrderChildren] = useImmerReducer<
    React.ReactElement[],
    | { type: 'onDragStart'; data: { __index: number; placeholder: React.ReactElement } }
    | { type: 'onDrag'; data: { __index: number; center: { top: number; left: number }; placeholder: React.ReactElement } }
  >(
    (draft, action) => {
      if (action.type === 'onDragStart') {
        const { __index, placeholder } = action.data;
        const index = draft.findIndex((orderChild) => (orderChild as React.ReactElement).props.__index === __index);
        draft.splice(
          index,
          0,
          React.cloneElement(placeholder, {
            ...placeholder.props,
            key: `${dPrefix}drop-placeholder-${id}`,
            className: getClassName(dPlaceholderClass, placeholder.props.className),
            style: { ...dPlaceholderStyle, ...placeholder.props.style },
            [`data-${dPrefix}drop-placeholder-${id}`]: 'true',
          })
        );
      }
      if (action.type === 'onDrag') {
        const { __index, center, placeholder } = action.data;
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
        let placeholderIndex: number | undefined;
        const calculate = (el: HTMLElement, index?: number) => {
          const elRect = el.getBoundingClientRect() as DOMRect;
          const elCenter = { top: elRect.top + elRect.height / 2, left: elRect.left + elRect.width / 2 };
          const distance = Math.pow(Math.pow(elCenter.top - center.top, 2) + Math.pow(elCenter.left - center.left, 2), 0.5);
          if (isUndefined(minDistance) || distance < minDistance) {
            minDistance = distance;
            placeholderIndex = index;
            console.log(placeholderIndex);
            quadrant = getQuadrant(center, elCenter);
            // replaceIndex = quadrant === Quadrant.One || quadrant === Quadrant.Two ? index : index + 1;
          }
        };
        if (dropPlaceholderEl.current) {
          calculate(dropPlaceholderEl.current);
        }
        draft.forEach((node) => {
          if (node.props.__index !== __index) {
            const el = currentData.els.get(node.props.__index)?.current;
            if (el) {
              calculate(el, node.props.__index);
            }
          }
        });

        if (!isUndefined(placeholderIndex)) {
          const index = draft.findIndex((node) => node.props[`data-${dPrefix}drop-placeholder-${id}`]);
          if (index !== -1) {
            draft.splice(index, 1);
          }
          let replaceIndex = draft.findIndex((node) => node.props.__index === placeholderIndex);
          replaceIndex = quadrant === Quadrant.One || quadrant === Quadrant.Two ? replaceIndex : replaceIndex + 1;
          draft.splice(
            replaceIndex,
            0,
            React.cloneElement(placeholder, {
              ...placeholder.props,
              key: `${dPrefix}drop-placeholder-${id}`,
              className: getClassName(dPlaceholderClass, placeholder.props.className),
              style: { ...dPlaceholderStyle, ...placeholder.props.style },
              [`data-${dPrefix}drop-placeholder-${id}`]: 'true',
            })
          );
        }
      }
      return draft;
    },
    React.Children.toArray(children).map((child, index) => {
      const _child = child as React.ReactElement;
      let placeholderNode: React.ReactElement;
      return React.cloneElement(_child, {
        ..._child.props,
        dPlaceholder: false,
        __index: index,
        __onDragStart: (__index: number, placeholder: React.ReactElement) => {
          placeholderNode = placeholder;
          dispatchOrderChildren({ type: 'onDragStart', data: { __index, placeholder } });
        },
        __onDrag: (__index: number, center: { top: number; left: number }) => {
          dispatchOrderChildren({ type: 'onDrag', data: { __index, center, placeholder: placeholderNode } });
        },
      });
    })
  );

  const childs = useMemo(() => {
    React.Children.map(children, (child, index) => {
      const _child = child as React.ReactElement;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      currentData,
    }),
    [currentData]
  );

  return (
    <DDropContext.Provider value={contextValue}>
      {React.createElement(
        dTag,
        {
          ...restProps,
        },
        [...orderChildren]
      )}
    </DDropContext.Provider>
  );
}
