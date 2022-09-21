/* eslint-disable @typescript-eslint/no-empty-function */
import type { FormControlStatus } from './abstract-control';
import type { AsyncValidatorFn, ValidatorFn } from './validators';

import { AbstractControl, VALID } from './abstract-control';

export interface FormControlState<V> {
  value: V;
  disabled?: boolean;
}

export class FormControl<V> extends AbstractControl<V> {
  public readonly defaultState: FormControlState<V> | V;

  protected _value!: V;
  protected _status: FormControlStatus = VALID;

  constructor(
    formState: FormControlState<V> | V,
    validators?: ValidatorFn | ValidatorFn[] | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(validators ?? null, asyncValidator ?? null);
    this.defaultState = formState;
    this._applyFormState(formState);
    this.updateValueAndValidity(true);
  }

  override setValue(value: V, onlySelf?: boolean): void {
    this._value = value;
    this.updateValueAndValidity(onlySelf);
  }
  override patchValue(value: V, onlySelf?: boolean): void {
    this.setValue(value, onlySelf);
  }
  override reset(formState: V | FormControlState<V> = this.defaultState, onlySelf?: boolean): void {
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

  protected _isFormStateObject(formState: FormControlState<V> | V): formState is FormControlState<V> {
    return (
      typeof formState === 'object' &&
      formState !== null &&
      Object.keys(formState).length === 2 &&
      'value' in formState &&
      'disabled' in formState
    );
  }

  private _applyFormState(formState: FormControlState<V> | V) {
    if (this._isFormStateObject(formState)) {
      this._value = formState.value;
      formState.disabled ? this.disable(true) : this.enable(true);
    } else {
      this._value = formState;
    }
  }
}
