/* eslint-disable @typescript-eslint/no-empty-function */
import type { FormControlStatus } from './abstract-control';
import type { AsyncValidatorFn, ValidatorFn } from './validators';

import { isArray, isString } from 'lodash';

import { AbstractControl, VALID } from './abstract-control';

export class FormControl extends AbstractControl {
  protected _value: any;
  protected _status: FormControlStatus = VALID;

  constructor(
    formState: any = null,
    validators?: ValidatorFn | ValidatorFn[] | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(validators ?? null, asyncValidator ?? null);
    this._applyFormState(formState);
    this.updateValueAndValidity(true);
  }

  override setValue(value: any, onlySelf?: boolean): void {
    this._value = value;
    this.updateValueAndValidity(onlySelf);
  }
  override patchValue(value: any, onlySelf?: boolean): void {
    this.setValue(value, onlySelf);
  }
  override reset(formState: any = null, onlySelf?: boolean): void {
    if (isString(this.value)) {
      formState = '';
    } else if (isArray(this.value)) {
      formState = [];
    }
    this._applyFormState(formState);
    this.markAsPristine(onlySelf);
    this.setValue(this.value, onlySelf);
  }

  protected override _updateValue() {}

  protected override _forEachChild(): void {}

  protected override _anyControls(): boolean {
    return false;
  }

  protected override _allControlsDisabled(): boolean {
    return this.disabled;
  }

  private _applyFormState(formState: any) {
    if (this._isBoxedValue(formState)) {
      this._value = formState.value;
      formState.disabled ? this.disable(true) : this.enable(true);
    } else {
      this._value = formState;
    }
  }
}
