export interface TreeOption<V> {
  dLabel: string;
  dValue: V;
  dDisabled?: boolean;
  dChildren?: TreeOption<V>[];
  [index: string | symbol]: unknown;
}

export type TreeNodeStatus = 'INDETERMINATE' | 'CHECKED' | 'UNCHECKED';

const [INDETERMINATE, CHECKED, UNCHECKED] = ['INDETERMINATE', 'CHECKED', 'UNCHECKED'] as TreeNodeStatus[];

export abstract class AbstractTreeNode<V, O> {
  private _parent: AbstractTreeNode<V, O> | null = null;

  constructor(public node: O) {}

  get parent(): AbstractTreeNode<V, O> | null {
    return this._parent;
  }
  get root(): AbstractTreeNode<V, O> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: AbstractTreeNode<V, O> = this;

    while (node.parent) {
      node = node.parent;
    }

    return node;
  }

  get isLeaf(): boolean {
    return !this.children;
  }

  get value(): V[] {
    return this._value;
  }
  get id(): string[] {
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

  updateStatus(checkeds: V[] | null | V[][], onlySelf = false): void {
    this._calculateStatus(checkeds);

    this._updateAncestors(checkeds, onlySelf);
  }

  protected _setParent(parent: AbstractTreeNode<V, O>): void {
    this._parent = parent;
  }

  protected _updateAncestors(checkeds: V[] | null | V[][], onlySelf: boolean) {
    if (this._parent && !onlySelf) {
      this._parent.updateStatus(checkeds, onlySelf);
    }
  }

  abstract children: AbstractTreeNode<V, O>[] | null;

  protected abstract _value: V[];
  protected abstract _id: string[];

  protected abstract _status: TreeNodeStatus;
  protected abstract _disabled: boolean;

  protected abstract _calculateStatus(checkeds: V[] | null | V[][]): void;
}

export class SingleTreeNode<V, O extends TreeOption<V>> extends AbstractTreeNode<V, O> {
  children: SingleTreeNode<V, O>[] | null = null;

  protected _value: V[];
  protected _id: string[];
  protected _status!: TreeNodeStatus;
  protected _disabled: boolean;

  constructor(
    node: O,
    private opts: {
      checkedRef: React.MutableRefObject<{ node?: SingleTreeNode<V, O> }>;
      checkeds: V[];
      getId: (value: V) => string;
      parent?: { value: V[]; id: string[]; disabled: boolean };
    }
  ) {
    super(node);
    if (opts.parent) {
      this._value = opts.parent.value.concat([node.dValue]);
      this._id = opts.parent.id.concat([opts.getId(node.dValue)]);
      this._disabled = !!(opts.parent.disabled || node.dDisabled);
    } else {
      this._value = [node.dValue];
      this._id = [opts.getId(node.dValue)];
      this._disabled = !!node.dDisabled;
    }

    this._setUpChildren();
    this.updateStatus(opts.checkeds, true);
  }

  setChecked(): V[] {
    if (this.opts.checkedRef.current.node) {
      let node = this.opts.checkedRef.current.node;
      node._status = UNCHECKED;

      while (node.parent) {
        node = node.parent as SingleTreeNode<V, O>;
        node._status = UNCHECKED;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: SingleTreeNode<V, O> = this;
    this.opts.checkedRef.current.node = node;
    node._status = CHECKED;

    while (node.parent) {
      node = node.parent as SingleTreeNode<V, O>;
      node._status = CHECKED;
    }

    return this.value;
  }

  private _setUpChildren(): void {
    if (this.node.dChildren) {
      this.children = this.node.dChildren.map((v) => {
        const node = new SingleTreeNode(
          v,
          Object.assign(this.opts, {
            parent: {
              value: this._value,
              id: this._id,
              disabled: this._disabled,
            },
          })
        );
        node._setParent(this);
        return node as SingleTreeNode<V, O>;
      });
    }
  }

  protected override _calculateStatus(checkeds: V[]): void {
    const checkedIds = checkeds.map((v) => this.opts.getId(v));
    this._status = this.id.every((id, index) => checkedIds[index] && checkedIds[index] === id) ? CHECKED : UNCHECKED;
    if (this._status === CHECKED) {
      if (this.opts.checkedRef.current.node) {
        if (this.opts.checkedRef.current.node.value.length < this.value.length) {
          this.opts.checkedRef.current.node = this;
        }
      } else {
        this.opts.checkedRef.current.node = this;
      }
    }
  }
}

export class MultipleTreeNode<V, O extends TreeOption<V>> extends AbstractTreeNode<V, O> {
  children: MultipleTreeNode<V, O>[] | null = null;

  protected _value: V[];
  protected _id: string[];
  protected _status!: TreeNodeStatus;
  protected _disabled: boolean;

  constructor(
    node: O,
    private opts: {
      checkeds: V[][];
      getId: (value: V) => string;
      parent?: { value: V[]; id: string[]; disabled: boolean };
    }
  ) {
    super(node);
    if (opts.parent) {
      this._value = opts.parent.value.concat([node.dValue]);
      this._id = opts.parent.id.concat([opts.getId(node.dValue)]);
      this._disabled = !!(opts.parent.disabled || node.dDisabled);
    } else {
      this._value = [node.dValue];
      this._id = [opts.getId(node.dValue)];
      this._disabled = !!node.dDisabled;
    }

    this._setUpChildren();
    this.updateStatus(opts.checkeds, true);
  }

  changeStatus(status: TreeNodeStatus, checkeds: V[][]): V[][] {
    const newCheckeds = this._changeStatus(status, checkeds);

    this._updateAncestors(newCheckeds, false);

    return newCheckeds;
  }

  protected override _calculateStatus(checkeds: V[][]): void {
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
      const checkedIds = checkeds.map((vs) => vs.map((v) => this.opts.getId(v)));
      const index = checkedIds.findIndex((checkeds) => this._id.every((id, index) => checkeds[index] && checkeds[index] === id));
      this._status = index === -1 ? UNCHECKED : CHECKED;
    }
  }

  protected _changeStatus(status: TreeNodeStatus, initValue: V[][]): V[][] {
    let res = [...initValue];
    if (this.enabled && this._status !== status) {
      this._status = status;
      if (this.children) {
        this.children.forEach((child) => {
          res = child._changeStatus(status, res);
        });
      } else {
        if (status === CHECKED) {
          res.push(this.value);
        } else {
          res = res.filter((checkeds) => !this.id.every((id, index) => checkeds[index] && this.opts.getId(checkeds[index]) === id));
        }
      }
    }

    return res;
  }

  private _setUpChildren(): void {
    if (this.node.dChildren) {
      this.children = this.node.dChildren.map((v) => {
        const node = new MultipleTreeNode(
          v,
          Object.assign(this.opts, {
            parent: {
              value: this._value,
              id: this._id,
              disabled: this._disabled,
            },
          })
        );
        node._setParent(this);
        return node as MultipleTreeNode<V, O>;
      });
    }
  }
}
