/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TreeOption {
  dLabel: string;
  dValue: any;
  dDisabled?: boolean;
  dChildren?: TreeOption[];
  [index: string | symbol]: unknown;
}

export type TreeNodeStatus = 'INDETERMINATE' | 'CHECKED' | 'UNCHECKED';

const [INDETERMINATE, CHECKED, UNCHECKED] = ['INDETERMINATE', 'CHECKED', 'UNCHECKED'] as TreeNodeStatus[];

export abstract class AbstractTreeNode {
  private _parent: AbstractTreeNode | null = null;

  constructor(public node: TreeOption) {}

  get parent(): AbstractTreeNode | null {
    return this._parent;
  }
  get root(): AbstractTreeNode {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: AbstractTreeNode = this;

    while (node.parent) {
      node = node.parent;
    }

    return node;
  }

  get isLeaf(): boolean {
    return !this.children;
  }

  get value(): any[] {
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

  protected setParent(parent: AbstractTreeNode): void {
    this._parent = parent;
  }

  abstract children: AbstractTreeNode[] | null;

  protected abstract _value: any[];
  protected abstract _id: string[];

  protected abstract _status: TreeNodeStatus;
  protected abstract _disabled: boolean;
}

export class SingleTreeNode extends AbstractTreeNode {
  children: SingleTreeNode[] | null = null;

  private _checkedIds: string[];

  protected _value: any[];
  protected _id: string[];
  protected _status!: TreeNodeStatus;
  protected _disabled: boolean;

  constructor(
    public node: TreeOption,
    private opts: {
      checkeds: any[];
      checkedIds?: string[];
      getId: (value: any) => string;
      parent?: { value: any[]; id: string[]; disabled: boolean };
    }
  ) {
    super(node);
    this._checkedIds = this.opts.checkedIds ? this.opts.checkedIds : this.opts.checkeds.map((v) => this.opts.getId(v));
    this._value = (this.opts.parent?.value ?? []).concat([this.node.dValue]);
    this._id = (this.opts.parent?.id ?? []).concat([this.opts.getId(this.node.dValue)]);
    this._disabled = (this.opts.parent?.disabled || this.node.dDisabled) ?? false;

    this._setUpChildren();
    this._updateStatus();
  }

  private _setUpChildren(): void {
    if (this.node.dChildren) {
      this.children = this.node.dChildren.map((v) => {
        const node = new SingleTreeNode(
          v,
          Object.assign(this.opts, {
            checkedIds: this._checkedIds,
            parent: {
              value: this._value,
              id: this._id,
              disabled: this._disabled,
            },
          })
        );
        node.setParent(this);
        return node;
      });
    }
  }

  private _updateStatus(): void {
    this._status = this.value.every((v, i) => this._checkedIds[i] && this._checkedIds[i] === this.opts.getId(v)) ? CHECKED : UNCHECKED;
  }
}

export class MultipleTreeNode extends AbstractTreeNode {
  children: MultipleTreeNode[] | null = null;

  private _checkedIds: string[][];

  protected _value: any[];
  protected _id: string[];
  protected _status!: TreeNodeStatus;
  protected _disabled: boolean;

  constructor(
    public node: TreeOption,
    public opts: {
      checkeds: any[][];
      checkedIds?: string[][];
      getId: (value: any) => string;
      parent?: { value: any[]; id: string[]; disabled: boolean };
    }
  ) {
    super(node);
    this._checkedIds = this.opts.checkedIds ? this.opts.checkedIds : this.opts.checkeds.map((vs) => vs.map((v) => this.opts.getId(v)));
    if (this.opts.parent) {
      this._value = this.opts.parent.value.concat([this.node.dValue]);
      this._id = this.opts.parent.id.concat([this.opts.getId(this.node.dValue)]);
      this._disabled = !!(this.opts.parent.disabled || this.node.dDisabled);
    } else {
      this._value = [this.node.dValue];
      this._id = [this.opts.getId(this.node.dValue)];
      this._disabled = !!this.node.dDisabled;
    }

    this._setUpChildren();
    this._updateStatus();
  }

  changeStatus(status: TreeNodeStatus, initValue?: any[][]): any[][] {
    let res = initValue ?? [...this.opts.checkeds];
    if (this.enabled && this._status !== status) {
      this._status = status;
      if (this.isLeaf) {
        if (status === CHECKED) {
          res.push(this.value);
        } else {
          const valueIds = this.value.map((v) => this.opts.getId(v));
          res = res.filter((checkeds) => !valueIds.every((v, i) => checkeds[i] && this.opts.getId(checkeds[i]) === v));
        }
      } else {
        this.children!.forEach((child) => {
          res = child.changeStatus(status, res);
        });
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
            checkedIds: this._checkedIds,
            parent: {
              value: this._value,
              id: this._id,
              disabled: this._disabled,
            },
          })
        );
        node.setParent(this);
        return node;
      });
    }
  }

  private _updateStatus(): void {
    if (this.isLeaf) {
      const index = this._checkedIds.findIndex((checkeds) => this._id.every((id, index) => checkeds[index] && checkeds[index] === id));
      this._status = index === -1 ? UNCHECKED : CHECKED;
    } else {
      let checkedNum = 0;
      let hasIndeterminate = false;
      for (const child of this.children!) {
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
        : checkedNum === this.children!.filter((item) => item.enabled).length
        ? CHECKED
        : INDETERMINATE;
    }
  }
}
