import type { DId } from '../../utils';
import type { TreeNodeStatus } from './abstract-node';

import { AbstractTreeNode, CHECKED, UNCHECKED } from './abstract-node';

export class SingleTreeNode<ID extends DId, T extends { disabled?: boolean; children?: T[] }> extends AbstractTreeNode<ID, T> {
  children?: SingleTreeNode<ID, T>[];

  protected _id: ID;
  protected _status!: TreeNodeStatus;
  protected _disabled: boolean;

  constructor(
    origin: T,
    private getId: (origin: T) => ID,
    private opts: {
      disabled?: boolean;
    }
  ) {
    super(origin);
    this._id = getId(origin);
    this._disabled = !!(opts.disabled || origin.disabled);

    this._setUpChildren();
  }

  private _setUpChildren(): void {
    if (this.origin.children) {
      this.children = this.origin.children.map((child) => {
        const node = new SingleTreeNode(
          child,
          this.getId,
          Object.assign(this.opts, {
            disabled: this._disabled,
          })
        );
        node._setParent(this);
        return node;
      });
    }
  }

  protected override _calculateStatus(checked: ID | null): void {
    this._status = this.id === checked ? CHECKED : UNCHECKED;
  }
}
