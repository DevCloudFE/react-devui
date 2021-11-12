import React from 'react';

import { KEY_PREFIX, getComponentName } from '../../utils';

export function isMenuComponent(component: React.ReactElement) {
  const componentName = getComponentName(component);
  return componentName === 'DMenu' || componentName === 'DMenuGroup' || componentName === 'DMenuItem' || componentName === 'DMenuSub';
}

export function generateChildren(children: React.ReactNode, adjustIndicator = false) {
  const _children = React.Children.toArray(children) as React.ReactElement[];
  return _children.map((child, index) => {
    if (isMenuComponent(child)) {
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
        className: adjustIndicator ? (_child.props.className ?? '' ? ` ${className}` : className) : _child.props.className,
        __id: (_child.key as string).slice(KEY_PREFIX.length),
      });
    }

    return child;
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
