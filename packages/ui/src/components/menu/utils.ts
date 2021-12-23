import React from 'react';

import { getClassName } from '../../utils';

export function generateChildren(children: React.ReactNode, adjustIndicator = false) {
  const _children = React.Children.toArray(children) as React.ReactElement[];
  return _children.map((child, index) => {
    const _child = child;
    let className = '';
    if (_children.length > 1) {
      if (index === 0) {
        className = 'is-first';
      }
      if (index === _children.length - 1) {
        className = 'is-last';
      }
    }
    return React.cloneElement(_child, {
      ..._child.props,
      className: getClassName(_child.props.className, { [className]: adjustIndicator }),
    });
  });
}

export function getAllIds(id: string, data?: Map<string, string[]>): string[] {
  const arr = [];
  const children = data?.get(id);
  if (children) {
    for (const child of children) {
      arr.push(child);
      arr.push(...getAllIds(child, data));
    }
  }
  return arr;
}

export interface DMenuCommonContextData {
  expandIds: Set<string>;
  onExpandChange: (id: string, expand: boolean) => void;
}
export const DMenuCommonContext = React.createContext<DMenuCommonContextData | null>(null);
