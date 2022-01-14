---
group: Data Entry
title: Form
---

Data entry and verification.

## When To Use

Need to verify the data.

## API

### DFormProps

Extend `React.FormHTMLAttributes<HTMLFormElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dForm | Bind the instance returned by [useForm](#useForm) | DFormInstance | - |
| dLabelWidth | Label length | number \| string | - |
| dLabelColon | Whether the label shows a colon | boolean | - |
| dCustomLabel | Custom label | 'required' \| 'optional' \| 'hidden' | 'required' |
| dLayout | Form layout | 'horizontal' \| 'vertical' \| 'inline' | 'horizontal' |
| dInlineSpan | Set the number of grids occupied by each form item in the row layout, a total of 12 grids | number \| true | 6 |
| dFeedbackIcon | Set the verification result feedback icon | boolean \| `{ success?: React.ReactNode; warning?: React.ReactNode; error?: React.ReactNode; pending?: React.ReactNode; }` | false |
| dSize | Set form size | 'smaller' \| 'larger' | - |
| dResponsiveProps | Responsive layout | `Record<DBreakpoints, Pick<DFormProps, 'dLabelWidth' \| 'dCustomLabel' \| 'dLayout' \| 'dInlineSpan'>>` | - |
<!-- prettier-ignore-end -->

### DFormGroupProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dFormGroupName | Check field name | string | - |
| dTitle | title | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DFormItem

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dLabel | Label | React.ReactNode | - |
| dLabelWidth | Label length, 0 will not render the label | number \| string | - |
| dLabelExtra | The additional information of the label, the object is rendered as a tooltip | `Array<{ title: string; icon?: React.ReactNode } \| string>` | - |
| dShowRequired | Is it displayed as required | boolean | - |
| dErrors | For information about verification failure, please refer to [Validity result](#FormValidityResultDemo) for specific usage | `DErrorInfo \| Array<[string, DErrorInfo]>` | - |
| dSpan | Number of grids occupied by form items | number \| string \| true | - |
| dResponsiveProps | Responsive layout | `Record<DBreakpoints, Pick<DFormItemProps, 'dLabelWidth' \| 'dSpan'>>` | - |
<!-- prettier-ignore-end -->

### DErrorInfo

```tsx
type DErrorInfo =
  | string
  | { message: string; status: 'warning' | 'error' }
  | { [index: string]: string | { message: string; status: 'warning' | 'error' } };
```

### useForm

```tsx
function useForm(initData: () => FormGroup): DFormInstance;

interface DFormInstance {
  form: FormGroup;
  initForm: () => void;
  updateForm: () => void;
}
```

### AbstractControl

```tsx
/**
 * A form can have several different statuses. Each
 * possible status is returned as a string literal.
 *
 * * **VALID**: Reports that a FormControl is valid, meaning that no errors exist in the input
 * value.
 * * **INVALID**: Reports that a FormControl is invalid, meaning that an error exists in the input
 * value.
 * * **PENDING**: Reports that a FormControl is pending, meaning that that async validation is
 * occurring and errors are not yet available for the input value.
 * * **DISABLED**: Reports that a FormControl is
 * disabled, meaning that the control is exempt from ancestor calculations of validity or value.
 *
 */
type FormControlStatus = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';

// Defines the map of errors returned from failed validation checks.
interface ValidationErrors {
  [key: string]: any;
}

// A function that receives a control and synchronously returns a map of validation errors if present, otherwise null.
type ValidatorFn = (control: AbstractControl) => ValidationErrors | null;

// A function that receives a control and returns a Promise or observable that emits validation errors if present, otherwise null.
type AsyncValidatorFn = (control: AbstractControl) => Promise<ValidationErrors | null>;

abstract class AbstractControl {
  constructor(
    // The function or array of functions that is used to determine the validity of this control synchronously.
    validators: ValidatorFn | ValidatorFn[] | null,
    // The function or array of functions that is used to determine validity of this control asynchronously.
    asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | null
  );

  // Returns the function that is used to determine the validity of this control synchronously.
  validator: ValidatorFn | null;

  // Returns the function that is used to determine the validity of this control asynchronously.
  asyncValidator: AsyncValidatorFn | null;

  // The parent control.
  readonly parent: AbstractControl;

  // Retrieves the top-level ancestor of this control.
  readonly root: AbstractControl;

  // The current value of the control.
  readonly value: any;

  // The validation status of the control.
  readonly status: FormControlStatus;

  // An object containing any errors generated by failing validation, or null if there are no errors.
  readonly errors: ValidationErrors | null;

  // A control is valid when its status is VALID.
  readonly valid: boolean;

  // A control is invalid when its status is INVALID.
  readonly invalid: boolean;

  // A control is pending when its status is PENDING.
  readonly pending: boolean;

  // A control is disabled when its status is DISABLED.
  readonly disabled: boolean;

  // A control is enabled as long as its status is not DISABLED.
  readonly enabled: boolean;

  // A control is pristine if onChange has not yet called.
  readonly pristine: boolean;

  // A control is dirty if onChange has called.
  readonly dirty: boolean;

  // Sets the synchronous validators that are active on this control. Calling this overwrites any existing synchronous validators.
  setValidators(validators: ValidatorFn | ValidatorFn[] | null): void;

  // Sets the asynchronous validators that are active on this control. Calling this overwrites any existing asynchronous validators.
  setAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[] | null): void;

  // Add a synchronous validator or validators to this control, without affecting other validators.
  addValidators(validators: ValidatorFn | ValidatorFn[]): void;

  // Add an asynchronous validator or validators to this control, without affecting other validators.
  addAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[]): void;

  // Remove a synchronous validator from this control, without affecting other validators.
  removeValidators(validators: ValidatorFn | ValidatorFn[]): void;

  // Remove an asynchronous validator from this control, without affecting other validators.
  removeAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[]): void;

  // Check whether a synchronous validator function is present on this control.
  hasValidator(validator: ValidatorFn): boolean;

  // Check whether an asynchronous validator function is present on this control.
  hasAsyncValidator(validator: AsyncValidatorFn): boolean;

  // Empties out the synchronous validator list.
  clearValidators(): void;

  // Empties out the async validator list.
  clearAsyncValidators(): void;

  // Marks the control as dirty.
  markAsDirty(onlySelf = false): void;

  // Marks the control as pristine.
  markAsPristine(onlySelf = false): void;

  // Marks the control as pending.
  markAsPending(onlySelf = false): void;

  // Disables the control. This means the control is exempt from validation checks and excluded from the aggregate value of any parent.
  disable(onlySelf = false): void;

  // Enables the control. This means the control is included in validation checks and the aggregate value of its parent.
  enable(onlySelf = false): void;

  // Sets the parent of the control.
  setParent(parent: FormGroup): void;

  // Sets errors on a form control when running validations manually, rather than automatically.
  setErrors(errors: ValidationErrors | null): void;

  // Recalculates the value and validation status of the control.
  updateValueAndValidity(onlySelf = false): void;

  // Retrieves a child control given the control's name or path.
  get(path: string[] | string): AbstractControl | null;

  // Reports error data for the control with the given path.
  getError(errorCode: string, path?: string[] | string): any;

  // Reports whether the control with the given path has the error specified.
  hasError(errorCode: string, path?: string[] | string): boolean;

  // Sets the value of the control.
  setValue(value: any, onlySelf?: boolean): void;

  // Patches the value of the control.
  patchValue(value: any, onlySelf?: boolean): void;

  // Resets the control.
  reset(formState: any = null, onlySelf?: boolean): void;
}
```

### FormControl

```tsx
class FormControl extends AbstractControl {
  constructor(
    // Initializes the control with an initial value, or an object that defines the initial value and disabled state.
    formState: any = null,
    validators?: ValidatorFn | ValidatorFn[] | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  );

  override setValue(value: any, onlySelf?: boolean): void;
  override patchValue(value: any, onlySelf?: boolean): void;
  override reset(formState: any = null, onlySelf?: boolean): void;
}
```

### FormControl

```tsx
class FormGroup extends AbstractControl {
  constructor(
    // A collection of child controls. The key for each child is the name under which it is registered.
    public controls: { [key: string]: AbstractControl },
    validators?: ValidatorFn | ValidatorFn[] | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  );

  // Add a control to this group.
  addControl(name: string, control: AbstractControl): void;

  // Remove a control from this group.
  removeControl(name: string): void;

  // Replace an existing control.
  setControl(name: string, control: AbstractControl): void;

  // Check whether there is an enabled control with the given name in the group.
  contains(controlName: string): boolean;

  override setValue(value: { [key: string]: any }, onlySelf?: boolean): void;
  override patchValue(value: { [key: string]: any }, onlySelf?: boolean): void;
  override reset(value: any = {}, onlySelf?: boolean): void;
}
```
