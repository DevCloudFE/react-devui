import type { DId } from '../../utils/types';
import type { TreeNodeStatus, TreeOrigin } from './abstract-node';

import { AbstractTreeNode, CHECKED, UNCHECKED, INDETERMINATE } from './abstract-node';

export class MultipleTreeNode<ID extends DId, T extends TreeOrigin> extends AbstractTreeNode<ID, T> {
  children?: MultipleTreeNode<ID, T>[];

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

  changeStatus(status: TreeNodeStatus, checkeds: Set<ID>): Set<ID> {
    const newCheckeds = this._changeStatus(status, checkeds);

    return newCheckeds;
  }

  protected override _calculateStatus(checkeds: Set<ID>): void {
    if (this.children) {
      let checkedNum = 0;
      let hasIndeterminate = false;
      let enabledLength = 0;
      for (const child of this.children) {
        if (child.enabled) {
          enabledLength += 1;
        }
        if (child.checked) {
          checkedNum += 1;
        } else if (child.enabled && child.indeterminate) {
          hasIndeterminate = true;
        }
      }
      this._status = hasIndeterminate
        ? INDETERMINATE
        : checkedNum === 0
        ? UNCHECKED
        : checkedNum === enabledLength
        ? CHECKED
        : INDETERMINATE;
    } else {
      this._status = checkeds.has(this._id) ? CHECKED : UNCHECKED;
    }
  }

  protected _changeStatus(status: TreeNodeStatus, initValue: Set<ID>): Set<ID> {
    let res = new Set(initValue);
    if (this.enabled && this._status !== status) {
      this._status = status;
      if (this.children) {
        this.children.forEach((child) => {
          res = child._changeStatus(status, res);
        });
      } else {
        if (status === CHECKED) {
          res.add(this._id);
        } else {
          res.delete(this._id);
        }
      }
    }

    return res;
  }

  private _setUpChildren(): void {
    if (this.origin.children) {
      this.children = this.origin.children.map((child) => {
        const node = new MultipleTreeNode(
          child as T,
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
}
