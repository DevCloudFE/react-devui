import { isArray } from 'lodash';
import { useEffect } from 'react';

import { useForceUpdate } from '@react-devui/hooks';

export type Control = string | number;
export type ControlMode = 'one' | 'all';
export interface ACLConfig {
  full?: boolean;
  controls?: Control[];
}

export class ACL {
  public controlMode: ControlMode = 'one';

  private _updates = new Set<() => void>();
  private _update() {
    for (const cb of this._updates) {
      cb();
    }
  }
  public addUpdateListener(cb: () => void) {
    this._updates.add(cb);
    return () => {
      this._updates.delete(cb);
    };
  }

  private _full: boolean;
  public get full(): boolean {
    return this._full;
  }
  public setFull(full: boolean) {
    this._full = full;
    this._update();
  }

  private _controls: Set<Control>;
  public get controls(): Control[] {
    return Array.from(this._controls);
  }
  public set(control: Control[]): void {
    this._controls = new Set(control);
    this._update();
  }
  public add(control: Control | Control[]): void {
    for (const v of isArray(control) ? control : [control]) {
      this._controls.add(v);
    }
    this._update();
  }
  public remove(control: Control | Control[]): void {
    for (const v of isArray(control) ? control : [control]) {
      this._controls.delete(v);
    }
    this._update();
  }

  public can(control: Control | Control[], mode = this.controlMode): boolean {
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

  constructor(config?: ACLConfig) {
    this._full = config?.full ?? false;
    this._controls = new Set(config?.controls ?? []);
  }
}

const acl = new ACL();

export function useACL() {
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    return acl.addUpdateListener(forceUpdate);
  }, [forceUpdate]);

  return acl;
}
