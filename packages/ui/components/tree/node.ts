import type { DId } from '../../utils';

/* eslint-disable @typescript-eslint/no-this-alias */
export type TreeNodeStatus = 'INDETERMINATE' | 'CHECKED' | 'UNCHECKED';

const [INDETERMINATE, CHECKED, UNCHECKED] = ['INDETERMINATE', 'CHECKED', 'UNCHECKED'] as TreeNodeStatus[];

export abstract class AbstractTreeNode<ID extends DId, T> {
  private _parent: AbstractTreeNode<ID, T> | null = null;

  constructor(public origin: T) {}

  get parent(): AbstractTreeNode<ID, T> | null {
    return this._parent;
  }
  get root(): AbstractTreeNode<ID, T> {
    let node: AbstractTreeNode<ID, T> = this;

    while (node.parent) {
      node = node.parent;
    }

    return node;
  }

  get isLeaf(): boolean {
    return !this.children;
  }

  get id(): ID {
    return this._id;
  }

  get status(): TreeNodeStatus {
    return this._status;
  }

  get checked(): boolean {
    return this._status === CHECKED;
  }
  get unchecked(): boolean {
    return this._status === UNCHECKED;
  }
  get indeterminate(): boolean {
    return this._status === INDETERMINATE;
  }

  get disabled(): boolean {
    return this._disabled;
  }
  get enabled(): boolean {
    return !this._disabled;
  }

  updateStatus(checked: ID | null | Set<ID>, onlySelf = false): void {
    if (this.children && !onlySelf) {
      this.children.forEach((child) => {
        child.updateStatus(checked, onlySelf);
      });
    }

    this._calculateStatus(checked);
  }

  protected _setParent(parent: AbstractTreeNode<ID, T>): void {
    this._parent = parent;
  }

  protected _updateAncestors(checked: ID | null | Set<ID>, onlySelf: boolean) {
    if (this._parent && !onlySelf) {
      this._parent.updateStatus(checked, onlySelf);
    }
  }

  abstract children?: AbstractTreeNode<ID, T>[];

  protected abstract _id: ID;

  protected abstract _status: TreeNodeStatus;
  protected abstract _disabled: boolean;

  protected abstract _calculateStatus(checked: ID | null | Set<ID>): void;
}

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

export class MultipleTreeNode<ID extends DId, T extends { disabled?: boolean; children?: T[] }> extends AbstractTreeNode<ID, T> {
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
      this.children = this.origin.children.map((v) => {
        const node = new MultipleTreeNode(
          v,
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
