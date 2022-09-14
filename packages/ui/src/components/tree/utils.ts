import type { DId } from '../../utils/types';
import type { AbstractTreeNode, TreeOrigin } from './abstract-node';

export const SEPARATOR = ' / ';
export const TREE_NODE_KEY = Symbol();

export function getText<V extends DId, T extends TreeOrigin & { label: string }>(node: AbstractTreeNode<V, T>) {
  const text = [node.origin.label];
  let n = node;
  while (n.parent) {
    n = n.parent;
    text.unshift(n.origin.label);
  }
  return text.join(SEPARATOR);
}
