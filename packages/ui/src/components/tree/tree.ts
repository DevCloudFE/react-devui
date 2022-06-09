import type { DId } from '../../utils/global';

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
    let origin: AbstractTreeNode<ID, T> = this;

    while (origin.parent) {
      origin = origin.parent;
    }

    return origin;
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

  updateStatus(checked: ID | null | ID[], onlySelf = false): void {
    this._calculateStatus(checked);

    this._updateAncestors(checked, onlySelf);
  }

  protected _setParent(parent: AbstractTreeNode<ID, T>): void {
    this._parent = parent;
  }

  protected _updateAncestors(checked: ID | null | ID[], onlySelf: boolean) {
    if (this._parent && !onlySelf) {
      this._parent.updateStatus(checked, onlySelf);
    }
  }

  abstract children?: AbstractTreeNode<ID, T>[];

  protected abstract _id: ID;

  protected abstract _status: TreeNodeStatus;
  protected abstract _disabled: boolean;

  protected abstract _calculateStatus(checked: ID | null | ID[]): void;
}

export class SingleTreeNode<ID extends DId, T extends { disabled?: boolean; children?: T[] }> extends AbstractTreeNode<ID, T> {
  children?: SingleTreeNode<ID, T>[];

  protected _id: ID;
  protected _status!: TreeNodeStatus;
  protected _disabled: boolean;

  constructor(
    origin: T,
    private getId: (o: T) => ID,
    private opts: {
      checkedRef: React.MutableRefObject<SingleTreeNode<ID, T> | undefined>;
      checked: ID | null;
      disabled?: boolean;
    }
  ) {
    super(origin);
    this._id = getId(origin);
    this._disabled = !!(opts.disabled || origin.disabled);

    this._setUpChildren();
    this.updateStatus(opts.checked, true);
  }

  setChecked(): void {
    if (this.opts.checkedRef.current) {
      let origin = this.opts.checkedRef.current;
      origin._status = UNCHECKED;

      while (origin.parent) {
        origin = origin.parent as SingleTreeNode<ID, T>;
        origin._status = UNCHECKED;
      }
    }

    let origin: SingleTreeNode<ID, T> = this;
    this.opts.checkedRef.current = origin;
    origin._status = CHECKED;

    while (origin.parent) {
      origin = origin.parent as SingleTreeNode<ID, T>;
      origin._status = CHECKED;
    }
  }

  private _setUpChildren(): void {
    if (this.origin.children) {
      this.children = this.origin.children.map((v) => {
        const origin = new SingleTreeNode(
          v,
          this.getId,
          Object.assign(this.opts, {
            disabled: this._disabled,
          })
        );
        origin._setParent(this);
        return origin;
      });
    }
  }

  protected override _calculateStatus(checked: ID | null): void {
    this._status = this.id === checked ? CHECKED : UNCHECKED;
    if (this._status === CHECKED) {
      this.opts.checkedRef.current = this;
    }
  }
}

export class MultipleTreeNode<ID extends DId, T extends { disabled?: boolean; children?: T[] }> extends AbstractTreeNode<ID, T> {
  children?: MultipleTreeNode<ID, T>[];

  protected _id: ID;
  protected _status!: TreeNodeStatus;
  protected _disabled: boolean;

  constructor(
    origin: T,
    private getId: (o: T) => ID,
    private opts: {
      checkeds: ID[];
      disabled?: boolean;
    }
  ) {
    super(origin);
    this._id = getId(origin);
    this._disabled = !!(opts.disabled || origin.disabled);

    this._setUpChildren();
    this.updateStatus(opts.checkeds, true);
  }

  changeStatus(status: TreeNodeStatus, checkeds: ID[]): ID[] {
    const newCheckeds = this._changeStatus(status, checkeds);

    this._updateAncestors(newCheckeds, false);

    return newCheckeds;
  }

  protected override _calculateStatus(checkeds: ID[]): void {
    if (this.children) {
      let checkedNum = 0;
      let hasIndeterminate = false;
      for (const child of this.children) {
        if (child.checked) {
          checkedNum += 1;
        } else if (child.enabled && child.indeterminate) {
          hasIndeterminate = true;
          break;
        }
      }
      this._status = hasIndeterminate
        ? INDETERMINATE
        : checkedNum === 0
        ? UNCHECKED
        : checkedNum === this.children.filter((item) => item.enabled).length
        ? CHECKED
        : INDETERMINATE;
    } else {
      this._status = checkeds.includes(this._id) ? CHECKED : UNCHECKED;
    }
  }

  protected _changeStatus(status: TreeNodeStatus, initValue: ID[]): ID[] {
    let res = [...initValue];
    if (this.enabled && this._status !== status) {
      this._status = status;
      if (this.children) {
        this.children.forEach((child) => {
          res = child._changeStatus(status, res);
        });
      } else {
        if (status === CHECKED) {
          res.push(this._id);
        } else {
          res = res.filter((v) => v !== this._id);
        }
      }
    }

    return res;
  }

  private _setUpChildren(): void {
    if (this.origin.children) {
      this.children = this.origin.children.map((v) => {
        const origin = new MultipleTreeNode(
          v,
          this.getId,
          Object.assign(this.opts, {
            disabled: this._disabled,
          })
        );
        origin._setParent(this);
        return origin;
      });
    }
  }
}
