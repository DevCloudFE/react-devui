import type { DElementSelector } from '../../hooks/element';

import { isUndefined } from 'lodash';
import React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import { useImmer } from 'use-immer';

import { useDComponentConfig, useElement, useId, useThrottle, useAsync, useDPrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';

export type DDropContextData = {
  onDrag: () => void;
} | null;
export const DDropContext = React.createContext<DDropContextData>(null);

export interface DDropProps extends React.HTMLAttributes<HTMLDivElement> {
  dTag?: string;
  dDirection: 'horizontal' | 'vertical';
  children: React.ReactNode;
  [index: string]: unknown;
}

export function DDrop(props: DDropProps) {
  const { dTag = 'div', dDirection = 'vertical', children, ...restProps } = useDComponentConfig('drop', props);

  const dPrefix = useDPrefixConfig();

  const [orderChildren, setOrderChildren] = useImmer<React.ReactElement[]>([]);

  useEffect(() => {
    setOrderChildren(
      React.Children.toArray(children).map((child, index) => {
        const _child = child as React.ReactElement;
        return React.cloneElement(_child, {
          ..._child.props,
          __onDrag: (rect: DOMRect) => {
            console.log(rect);
          },
        });
      })
    );
  }, [children, setOrderChildren]);

  return React.createElement(
    dTag,
    {
      ...restProps,
    },
    [...orderChildren]
  );
}
