import { isArray } from 'lodash';
import { useSyncExternalStore } from 'react';

export type Control = string | number;
export type ControlMode = 'one' | 'all';

export class ACL {
  private _full = false;
  private _controls = new Set<Control>();

  public get full(): boolean {
    return this._full;
  }

  public get controls(): Control[] {
    return Array.from(this._controls);
  }

  public setFull(full: boolean) {
    this._full = full;
    emitChange();
  }

  public set(control: Control[]): void {
    this._controls = new Set(control);
    emitChange();
  }

  public add(control: Control | Control[]): void {
    for (const v of isArray(control) ? control : [control]) {
      this._controls.add(v);
    }
    emitChange();
  }

  public remove(control: Control | Control[]): void {
    for (const v of isArray(control) ? control : [control]) {
      this._controls.delete(v);
    }
    emitChange();
  }

  public can(control: Control | Control[], mode: ControlMode = 'one'): boolean {
    if (this._full) {
      return true;
    }

    const arr = isArray(control) ? control : [control];

    let n = 0;
    for (const v of arr) {
      if (this._controls.has(v)) {
        n += 1;
      }
    }

    if (n > 0 && (mode === 'one' || (mode === 'all' && n === arr.length))) {
      return true;
    }
    return false;
  }
}

const acl = new ACL();

let listeners: (() => void)[] = [];

function subscribe(onStoreChange: () => void) {
  listeners = listeners.concat([onStoreChange]);
  return () => {
    listeners = listeners.filter((f) => f !== onStoreChange);
  };
}

function getSnapshot() {
  return acl;
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function useACL() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
