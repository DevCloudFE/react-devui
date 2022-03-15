import type { DId } from '../../types';
import type { AbstractTreeNode } from '../tree';

export const SEPARATOR = ' / ';
export const TREE_NODE_KEY = Symbol();

export function getText<ID extends DId>(node: AbstractTreeNode<ID, { label: string }>) {
  const text = [node.origin.label];
  let n = node;
  while (n.parent) {
    n = n.parent;
    text.unshift(n.origin.label);
  }
  return text.join(SEPARATOR);
}
