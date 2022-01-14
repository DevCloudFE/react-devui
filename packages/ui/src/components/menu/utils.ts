import React from 'react';

import { getClassName } from '../../utils';

export function generateChildren(children: React.ReactNode, adjustIndicator = false) {
  const length = React.Children.count(children);
  return React.Children.map(children as React.ReactElement[], (child, index) => {
    let className = '';
    if (length > 1) {
      if (index === 0) {
        className = 'is-first';
      }
      if (index === length - 1) {
        className = 'is-last';
      }
    }
    return React.cloneElement(child, {
      ...child.props,
      className: getClassName(child.props.className, { [className]: adjustIndicator }),
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
