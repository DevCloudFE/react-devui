/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

// Refer to Angular [forms](https://github.com/angular/angular/blob/13.1.1/packages/forms)

import type { Subscription } from 'rxjs';

import { isArray, isNull, isNumber, isString } from 'lodash';
import { from, Subject } from 'rxjs';
import { forkJoin } from 'rxjs';

export interface ValidationErrors {
  [key: string]: any;
}

export type ValidatorFn = (control: AbstractControl) => ValidationErrors | null;

export type AsyncValidatorFn = (control: AbstractControl) => Promise<ValidationErrors | null>;

export type FormControlStatus = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';

const [VALID, INVALID, PENDING, DISABLED] = ['VALID', 'INVALID', 'PENDING', 'DISABLED'] as FormControlStatus[];

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

function mergeErrors(arrayOfErrors: Array<ValidationErrors | null>): ValidationErrors | null {
  const res: { [key: string]: any } = {};

  arrayOfErrors.forEach((errors: ValidationErrors | null) => {
    if (errors != null) {
      Object.assign(res, errors);
    }
  });

  return Object.keys(res).length === 0 ? null : res;
}

function composeValidators(validators: Array<ValidatorFn | null>): ValidatorFn | null {
  const presentValidators = validators.filter((validator) => validator !== null) as ValidatorFn[];
  if (presentValidators.length === 0) {
    return null;
  }

  return function (control: AbstractControl) {
    return mergeErrors(presentValidators.map((fn) => fn(control)));
  };
}
function composeAsyncValidators(validators: Array<AsyncValidatorFn | null>): AsyncValidatorFn | null {
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

export abstract class AbstractControl {
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let control: AbstractControl = this;

    while (control.parent) {
      control = control.parent;
    }

    return control;
  }

  get value(): any {
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

  public readonly asyncVerifyComplete = new Subject<AbstractControl>();

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

  protected abstract _value: any;

  protected abstract _status: FormControlStatus;

  abstract setValue(value: any, onlySelf?: boolean): void;
  abstract patchValue(value: any, onlySelf?: boolean): void;
  abstract reset(value?: any, onlySelf?: boolean): void;

  protected abstract _updateValue(): void;

  protected abstract _forEachChild(cb: (c: AbstractControl) => void): void;

  protected abstract _anyControls(condition: (c: AbstractControl) => boolean): boolean;

  protected abstract _allControlsDisabled(): boolean;

  protected _isBoxedValue(formState: any): boolean {
    return (
      typeof formState === 'object' &&
      formState !== null &&
      Object.keys(formState).length === 2 &&
      'value' in formState &&
      'disabled' in formState
    );
  }

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
        this.asyncVerifyComplete.next(this);
      });
    }
  }
}

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

export class Validators {
  static min(min: number): ValidatorFn {
    return (control) => {
      if (isString(control.value) || isNumber(control.value)) {
        const value = Number(control.value);
        if (Number.isNaN(value)) {
          return null;
        } else {
          return value < min ? { min: { min, actual: control.value } } : null;
        }
      }

      return null;
    };
  }

  static max(max: number): ValidatorFn {
    return (control) => {
      if (isString(control.value) || isNumber(control.value)) {
        const value = Number(control.value);
        if (Number.isNaN(value)) {
          return null;
        } else {
          return value > max ? { max: { max, actual: control.value } } : null;
        }
      }

      return null;
    };
  }

  static required(control: AbstractControl): ValidationErrors | null {
    const isEmpty = isArray(control.value) || isString(control.value) ? control.value.length === 0 : isNull(control.value) ? true : false;
    return isEmpty ? { required: true } : null;
  }

  static email(control: AbstractControl): ValidationErrors | null {
    if (
      isString(control.value) &&
      !/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
        control.value
      )
    ) {
      return { email: true };
    }

    return null;
  }

  static minLength(minLength: number): ValidatorFn {
    return (control) => {
      if ((isArray(control.value) || isString(control.value)) && control.value.length < minLength) {
        return { minLength: { minLength, actual: control.value.length } };
      }

      return null;
    };
  }

  static maxLength(maxLength: number): ValidatorFn {
    return (control) => {
      if ((isArray(control.value) || isString(control.value)) && control.value.length > maxLength) {
        return { maxLength: { maxLength, actual: control.value.length } };
      }

      return null;
    };
  }

  static pattern(pattern: string | RegExp): ValidatorFn {
    if (!pattern) return () => null;
    let regex: RegExp;
    let regexStr: string;
    if (isString(pattern)) {
      regexStr = '';

      if (pattern.charAt(0) !== '^') regexStr += '^';

      regexStr += pattern;

      if (pattern.charAt(pattern.length - 1) !== '$') regexStr += '$';

      regex = new RegExp(regexStr);
    } else {
      regexStr = pattern.toString();
      regex = pattern;
    }

    return (control) => {
      if ((isString(control.value) || isNumber(control.value)) && !regex.test(control.value.toString())) {
        return { pattern: { pattern: regexStr, actual: control.value } };
      }

      return null;
    };
  }
}
