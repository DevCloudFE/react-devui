import type { DId } from '../../utils/global';
import type { AbstractTreeNode } from '../tree/node';

export const SEPARATOR = ' / ';
export const TREE_NODE_KEY = Symbol();

export function getText<V extends DId>(node: AbstractTreeNode<V, { label: string }>) {
  const text = [node.origin.label];
  let n = node;
  while (n.parent) {
    n = n.parent;
    text.unshift(n.origin.label);
  }
  return text.join(SEPARATOR);
}
