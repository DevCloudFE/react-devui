import type { AbstractControl } from './abstract-control';

import { isArray, isNull, isNumber, isString } from 'lodash';

export interface ValidationErrors {
  [key: string]: any;
}

export type ValidatorFn = (control: AbstractControl) => ValidationErrors | null;

export type AsyncValidatorFn = (control: AbstractControl) => Promise<ValidationErrors | null>;

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
