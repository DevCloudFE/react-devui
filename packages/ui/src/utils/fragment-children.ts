import { isObject } from 'lodash';
import React from 'react';

export function getFragmentChildren(node: React.ReactNode): React.ReactNode {
  if (isObject(node)) {
    if ('type' in node && node.type === React.Fragment) {
      return node.props.children;
    }
  }

  return node;
}
