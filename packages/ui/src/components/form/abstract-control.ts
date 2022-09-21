/* eslint-disable @typescript-eslint/no-this-alias */
import type { AsyncValidatorFn, ValidationErrors, ValidatorFn } from './validators';
import type { Subscription } from 'rxjs';

import { isArray } from 'lodash';
import { from, Subject } from 'rxjs';
import { forkJoin } from 'rxjs';

import { FormGroup } from './form-group';

export type FormControlStatus = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';

export const [VALID, INVALID, PENDING, DISABLED] = ['VALID', 'INVALID', 'PENDING', 'DISABLED'] as FormControlStatus[];

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

function mergeErrors(arrayOfErrors: (ValidationErrors | null)[]): ValidationErrors | null {
  const res: { [key: string]: any } = {};

  arrayOfErrors.forEach((errors: ValidationErrors | null) => {
    if (errors != null) {
      Object.assign(res, errors);
    }
  });

  return Object.keys(res).length === 0 ? null : res;
}

function composeValidators(validators: (ValidatorFn | null)[]): ValidatorFn | null {
  const presentValidators = validators.filter((validator) => validator !== null) as ValidatorFn[];
  if (presentValidators.length === 0) {
    return null;
  }

  return function (control: AbstractControl) {
    return mergeErrors(presentValidators.map((fn) => fn(control)));
  };
}
function composeAsyncValidators(validators: (AsyncValidatorFn | null)[]): AsyncValidatorFn | null {
  const presentValidators = validators.filter((validator) => validator !== null) as AsyncValidatorFn[];
  if (presentValidators.length === 0) {
    return null;
  }

  return function (control: AbstractControl) {
    return new Promise((resolve) => {
      const observables = forkJoin(presentValidators.map((fn) => fn(control)));
      observables.subscribe({
        next: (errors) => {
          resolve(mergeErrors(errors));
        },
      });
    });
  };
}

function coerceToValidator(validator: ValidatorFn | ValidatorFn[] | null): ValidatorFn | null {
  return isArray(validator) ? composeValidators(validator) : validator;
}
function coerceToAsyncValidator(asyncValidator: AsyncValidatorFn | AsyncValidatorFn[] | null): AsyncValidatorFn | null {
  return isArray(asyncValidator) ? composeAsyncValidators(asyncValidator) : asyncValidator;
}

function makeValidatorsArray<T extends ValidatorFn | AsyncValidatorFn>(validators: T | T[] | null): T[] {
  if (!validators) {
    return [];
  }
  return isArray(validators) ? validators : [validators];
}
function hasValidator<T extends ValidatorFn | AsyncValidatorFn>(validators: T | T[] | null, validator: T): boolean {
  return Array.isArray(validators) ? validators.includes(validator) : validators === validator;
}
function addValidators<T extends ValidatorFn | AsyncValidatorFn>(validators: T | T[], currentValidators: T | T[] | null) {
  const current = makeValidatorsArray(currentValidators);
  const validatorsToAdd = makeValidatorsArray(validators);
  return current.concat(validatorsToAdd.filter((validator) => !hasValidator(current, validator)));
}
function removeValidators<T extends ValidatorFn | AsyncValidatorFn>(validators: T | T[], currentValidators: T | T[] | null): T[] {
  return makeValidatorsArray(currentValidators).filter((validator) => !hasValidator(validators, validator));
}

export abstract class AbstractControl<V = any> {
  private _parent: FormGroup | null = null;

  private _pristine: boolean = true;

  private _errors: ValidationErrors | null = null;

  private _hasOwnPendingAsyncValidator = false;
  private _asyncValidationSubscription?: Subscription;

  private _composedValidatorFn: ValidatorFn | null;
  private _composedAsyncValidatorFn: AsyncValidatorFn | null;

  private _rawValidators: ValidatorFn | ValidatorFn[] | null;
  private _rawAsyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | null;

  constructor(validators: ValidatorFn | ValidatorFn[] | null, asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | null) {
    this._rawValidators = validators;
    this._rawAsyncValidators = asyncValidators;
    this._composedValidatorFn = coerceToValidator(this._rawValidators);
    this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
  }

  get validator(): ValidatorFn | null {
    return this._composedValidatorFn;
  }
  set validator(validatorFn: ValidatorFn | null) {
    this._rawValidators = this._composedValidatorFn = validatorFn;
  }

  get asyncValidator(): AsyncValidatorFn | null {
    return this._composedAsyncValidatorFn;
  }
  set asyncValidator(asyncValidatorFn: AsyncValidatorFn | null) {
    this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
  }

  get parent(): FormGroup | null {
    return this._parent;
  }
  get root(): AbstractControl {
    let control: AbstractControl = this;

    while (control.parent) {
      control = control.parent;
    }

    return control;
  }

  get value(): V {
    return this._value;
  }

  get status(): FormControlStatus {
    return this._status;
  }

  get errors(): ValidationErrors | null {
    return this._errors;
  }

  get valid(): boolean {
    return this._status === VALID;
  }
  get invalid(): boolean {
    return this._status === INVALID;
  }
  get pending(): boolean {
    return this._status === PENDING;
  }
  get disabled(): boolean {
    return this._status === DISABLED;
  }
  get enabled(): boolean {
    return this._status !== DISABLED;
  }

  get pristine(): boolean {
    return this._pristine;
  }
  get dirty(): boolean {
    return !this._pristine;
  }

  public readonly asyncVerifyComplete$ = new Subject<AbstractControl<V>>();

  clone(): typeof this {
    return new Proxy(this, {});
  }

  setValidators(validators: ValidatorFn | ValidatorFn[] | null): void {
    this._rawValidators = validators;
    this._composedValidatorFn = coerceToValidator(validators);
  }
  setAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[] | null): void {
    this._rawAsyncValidators = validators;
    this._composedAsyncValidatorFn = coerceToAsyncValidator(validators);
  }

  addValidators(validators: ValidatorFn | ValidatorFn[]): void {
    this.setValidators(addValidators(validators, this._rawValidators));
  }
  addAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[]): void {
    this.setAsyncValidators(addValidators(validators, this._rawAsyncValidators));
  }

  removeValidators(validators: ValidatorFn | ValidatorFn[]): void {
    this.setValidators(removeValidators(validators, this._rawValidators));
  }
  removeAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[]): void {
    this.setAsyncValidators(removeValidators(validators, this._rawAsyncValidators));
  }

  hasValidator(validator: ValidatorFn): boolean {
    return hasValidator(this._rawValidators, validator);
  }
  hasAsyncValidator(validator: AsyncValidatorFn): boolean {
    return hasValidator(this._rawAsyncValidators, validator);
  }

  clearValidators(): void {
    this.validator = null;
  }
  clearAsyncValidators(): void {
    this.asyncValidator = null;
  }

  markAsDirty(onlySelf = false): void {
    this._pristine = false;

    if (this._parent && !onlySelf) {
      this._parent.markAsDirty(onlySelf);
    }
  }
  markAsPristine(onlySelf = false): void {
    this._pristine = true;

    this._forEachChild((control) => {
      control.markAsPristine(true);
    });

    if (this._parent && !onlySelf) {
      this._parent._updatePristine(onlySelf);
    }
  }
  markAsPending(onlySelf = false): void {
    this._status = PENDING;

    if (this._parent && !onlySelf) {
      this._parent.markAsPending(onlySelf);
    }
  }

  disable(onlySelf = false): void {
    // If parent has been marked artificially dirty we don't want to re-calculate the
    // parent's dirtiness based on the children.
    const skipPristineCheck = this._parentMarkedDirty(onlySelf);

    this._status = DISABLED;
    this._forEachChild((control) => {
      control.disable(true);
    });

    this._updateAncestors(onlySelf, skipPristineCheck);
  }
  enable(onlySelf = false): void {
    // If parent has been marked artificially dirty we don't want to re-calculate the
    // parent's dirtiness based on the children.
    const skipPristineCheck = this._parentMarkedDirty(onlySelf);

    this._status = VALID;
    this._forEachChild((control) => {
      control.enable(true);
    });
    this.updateValueAndValidity(true);

    this._updateAncestors(onlySelf, skipPristineCheck);
  }

  setParent(parent: FormGroup): void {
    this._parent = parent;
  }

  setErrors(errors: ValidationErrors | null): void {
    this._errors = errors;
    this._updateControlsErrors();
  }

  updateValueAndValidity(onlySelf = false): void {
    this._updateValue();

    if (this.enabled) {
      this._cancelExistingSubscription();
      this._errors = this._runValidator();
      this._status = this._calculateStatus();

      if (this.status === VALID || this.status === PENDING) {
        this._runAsyncValidator();
      }
    }

    if (this._parent && !onlySelf) {
      this._parent.updateValueAndValidity(onlySelf);
    }
  }

  get<S extends string>(path: S): AbstractControl<GetFormControlProperty<V, S>>;
  get<S extends ArrayLike<string>>(path: S): AbstractControl<GetFormControlPropertyFromArray<V, S>>;
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

  protected abstract _value: V;

  protected abstract _status: FormControlStatus;

  abstract setValue(value: V, onlySelf?: boolean): void;
  abstract patchValue(value: any, onlySelf?: boolean): void;
  abstract reset(value?: any, onlySelf?: boolean): void;

  protected abstract _updateValue(): void;

  protected abstract _forEachChild(cb: (c: AbstractControl) => void): void;

  protected abstract _anyControls(condition: (c: AbstractControl) => boolean): boolean;

  protected abstract _allControlsDisabled(): boolean;

  protected _anyControlsHaveStatus(status: FormControlStatus): boolean {
    return this._anyControls((control) => control.status === status);
  }

  protected _anyControlsDirty(): boolean {
    return this._anyControls((control) => control.dirty);
  }

  protected _parentMarkedDirty(onlySelf: boolean): boolean {
    return !!(!onlySelf && this._parent && this._parent.dirty && !this._parent._anyControlsDirty());
  }

  protected _updatePristine(onlySelf = false): void {
    this._pristine = !this._anyControlsDirty();

    if (this._parent && !onlySelf) {
      this._parent._updatePristine(onlySelf);
    }
  }

  protected _updateControlsErrors(): void {
    this._status = this._calculateStatus();

    if (this._parent) {
      this._parent._updateControlsErrors();
    }
  }

  protected _calculateStatus(): FormControlStatus {
    if (this._allControlsDisabled()) return DISABLED;
    if (this.errors) return INVALID;
    if (this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(PENDING)) return PENDING;
    if (this._anyControlsHaveStatus(INVALID)) return INVALID;
    return VALID;
  }

  protected _updateAncestors(onlySelf: boolean, skipPristineCheck: boolean) {
    if (this._parent && !onlySelf) {
      this._parent.updateValueAndValidity(onlySelf);
      if (!skipPristineCheck) {
        this._parent._updatePristine();
      }
    }
  }

  protected _runValidator(): ValidationErrors | null {
    return this.validator ? this.validator(this) : null;
  }

  protected _cancelExistingSubscription(): void {
    if (this._asyncValidationSubscription) {
      this._asyncValidationSubscription.unsubscribe();
      this._hasOwnPendingAsyncValidator = false;
    }
  }

  protected _runAsyncValidator(): void {
    if (this.asyncValidator) {
      this._status = PENDING;
      this._hasOwnPendingAsyncValidator = true;

      this._asyncValidationSubscription = from(this.asyncValidator(this)).subscribe((errors) => {
        this._hasOwnPendingAsyncValidator = false;
        // This will trigger the recalculation of the validation status, which depends on
        // the state of the asynchronous validation (whether it is in progress or not). So, it is
        // necessary that we have updated the `_hasOwnPendingAsyncValidator` boolean flag first.
        this.setErrors(errors);
        this.asyncVerifyComplete$.next(this);
      });
    }
  }
}
