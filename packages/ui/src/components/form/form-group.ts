import type { FormControlStatus } from './abstract-control';
import type { AsyncValidatorFn, ValidatorFn } from './validators';

import { AbstractControl, VALID } from './abstract-control';

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type GetFormControlPropertyFromArray<T, A> = Mutable<A> extends [infer K, ...infer R]
  ? K extends keyof T
    ? GetFormControlPropertyFromArray<T[K], R>
    : null
  : T;

type GetFormControlProperty<T, S> = S extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? GetFormControlProperty<T[K], R>
    : null
  : S extends keyof T
  ? T[S]
  : null;

function find(control: AbstractControl, path: string[] | string, delimiter: string) {
  if (path == null) return null;

  if (!Array.isArray(path)) {
    path = path.split(delimiter);
  }
  if (Array.isArray(path) && path.length === 0) return null;

  // Not using Array.reduce here due to a Chrome 80 bug
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
  let controlToFind: AbstractControl | null = control;
  path.forEach((name) => {
    if (controlToFind instanceof FormGroup) {
      controlToFind = name in controlToFind.controls ? controlToFind.controls[name] : null;
    } else {
      controlToFind = null;
    }
  });
  return controlToFind;
}

export class FormGroup<T extends { [K in keyof T]: AbstractControl } = any> extends AbstractControl<{ [K in keyof T]: T[K]['value'] }> {
  protected _value!: { [K in keyof T]: T[K]['value'] };
  protected _status: FormControlStatus = VALID;

  constructor(
    public controls: T,
    validators?: ValidatorFn | ValidatorFn[] | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(validators ?? null, asyncValidator ?? null);
    this._setUpControls();
    this.updateValueAndValidity(true);
  }

  get<S extends string>(path: S): AbstractControl<GetFormControlProperty<{ [K in keyof T]: T[K]['value'] }, S>>;
  get<S extends ArrayLike<string>>(path: S): AbstractControl<GetFormControlPropertyFromArray<{ [K in keyof T]: T[K]['value'] }, S>>;
  get(path: string[] | string): AbstractControl | null {
    return find(this, path, '.');
  }

  getError(errorCode: string, path?: string[] | string): any {
    const control = path ? this.get(path) : this;
    return control && control.errors ? control.errors[errorCode] : null;
  }

  hasError(errorCode: string, path?: string[] | string): boolean {
    return !!this.getError(errorCode, path);
  }

  addControl<K extends keyof T>(name: K, control: T[K]): void;
  addControl(name: string, control: AbstractControl): void;
  addControl(name: string, control: AbstractControl): void {
    if (!(name in this.controls)) {
      this.controls[name] = control;
      control.setParent(this);
    }
    this.updateValueAndValidity();
  }
  removeControl<K extends keyof T>(name: K): void;
  removeControl(name: string): void;
  removeControl(name: string): void {
    delete this.controls[name];
    this.updateValueAndValidity();
  }
  setControl<K extends keyof T>(name: K, control: T[K]): void;
  setControl(name: string, control: AbstractControl): void;
  setControl(name: string, control: AbstractControl): void {
    delete this.controls[name];
    this.addControl(name, control);
    this.updateValueAndValidity();
  }
  contains<K extends keyof T>(controlName: K): boolean;
  contains(controlName: string): boolean;
  contains(controlName: string): boolean {
    return controlName in this.controls;
  }

  override setValue(value: { [K in keyof T]: T[K]['value'] } & { [K: string]: any }, onlySelf?: boolean): void {
    this._checkAllValuesPresent(value);
    Object.keys(value).forEach((name) => {
      this._throwIfControlMissing(name);
      this.controls[name].setValue(value[name], true);
    });
    this.updateValueAndValidity(onlySelf);
  }
  override patchValue(value: { [K in keyof T]?: T[K]['value'] } & { [K: string]: any }, onlySelf?: boolean): void {
    Object.keys(value).forEach((name) => {
      if (this.controls[name]) {
        this.controls[name].patchValue(value[name], true);
      }
    });
    this.updateValueAndValidity(onlySelf);
  }
  override reset(value: { [K in keyof T]?: T[K]['value'] } & { [K: string]: any } = {}, onlySelf?: boolean): void {
    this._forEachChild((control, name) => {
      control.reset(value[name], true);
    });
    this._updatePristine(onlySelf);
    this.updateValueAndValidity(onlySelf);
  }

  protected override _updateValue(): void {
    this._value = this._reduceValue();
  }

  protected override _forEachChild(cb: (v: any, k: string) => void): void {
    Object.keys(this.controls).forEach((key) => {
      // The list of controls can change (for ex. controls might be removed) while the loop
      // is running (as a result of invoking Forms API in `valueChanges` subscription), so we
      // have to null check before invoking the callback.
      const control = this.controls[key];
      control && cb(control, key);
    });
  }

  protected override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    for (const controlName of Object.keys(this.controls)) {
      const control = this.controls[controlName];
      if (this.contains(controlName) && condition(control)) {
        return true;
      }
    }
    return false;
  }

  protected override _allControlsDisabled(): boolean {
    for (const controlName of Object.keys(this.controls)) {
      if (this.controls[controlName].enabled) {
        return false;
      }
    }
    return Object.keys(this.controls).length > 0 || this.disabled;
  }

  private _setUpControls(): void {
    this._forEachChild((control) => {
      control.setParent(this);
    });
  }

  private _reduceValue(): any {
    return this._reduceChildren({}, (acc: { [k: string]: any }, control, name): any => {
      acc[name] = control.value;
      return acc;
    });
  }

  private _reduceChildren<T>(initValue: T, fn: (acc: T, control: AbstractControl, name: string) => T): T {
    let res = initValue;
    this._forEachChild((control, name) => {
      res = fn(res, control, name);
    });
    return res;
  }

  private _checkAllValuesPresent(value: any): void {
    this._forEachChild((control, name) => {
      if (value[name] === undefined) {
        throw new Error(`Must supply a value for form control with name: '${name}'.`);
      }
    });
  }

  private _throwIfControlMissing(name: string): void {
    if (!Object.keys(this.controls).length) {
      throw new Error(`
          There are no form controls registered with this group yet. If you're using ngModel,
          you may want to check next tick (e.g. use setTimeout).
        `);
    }
    if (!this.controls[name]) {
      throw new Error(`Cannot find form control with name: ${name}.`);
    }
  }
}
