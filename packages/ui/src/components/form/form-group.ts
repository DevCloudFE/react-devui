import type { FormControlStatus } from './abstract-control';
import type { AsyncValidatorFn, ValidatorFn } from './validators';

import { AbstractControl, VALID } from './abstract-control';

export class FormGroup extends AbstractControl {
  protected _value: any;
  protected _status: FormControlStatus = VALID;

  constructor(
    public controls: { [key: string]: AbstractControl },
    validators?: ValidatorFn | ValidatorFn[] | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(validators ?? null, asyncValidator ?? null);
    this._setUpControls();
    this.updateValueAndValidity(true);
  }

  addControl(name: string, control: AbstractControl): void {
    if (!(name in this.controls)) {
      this.controls[name] = control;
      control.setParent(this);
    }
    this.updateValueAndValidity();
  }
  removeControl(name: string): void {
    delete this.controls[name];
    this.updateValueAndValidity();
  }
  setControl(name: string, control: AbstractControl): void {
    delete this.controls[name];
    this.addControl(name, control);
    this.updateValueAndValidity();
  }
  contains(controlName: string): boolean {
    return controlName in this.controls;
  }

  override setValue(value: { [key: string]: any }, onlySelf?: boolean): void {
    this._checkAllValuesPresent(value);
    Object.keys(value).forEach((name) => {
      this._throwIfControlMissing(name);
      this.controls[name].setValue(value[name], true);
    });
    this.updateValueAndValidity(onlySelf);
  }
  override patchValue(value: { [key: string]: any }, onlySelf?: boolean): void {
    Object.keys(value).forEach((name) => {
      if (this.controls[name]) {
        this.controls[name].patchValue(value[name], true);
      }
    });
    this.updateValueAndValidity(onlySelf);
  }
  override reset(value: any = {}, onlySelf?: boolean): void {
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

  private _reduceValue() {
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
