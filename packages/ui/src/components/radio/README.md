---
group: Data Entry
title: Radio
---

Radio group.

## When To Use

The user needs to select a single option from a data set, and can view all the available options side by side.

## API

### DRadioProps

Extend `React.HTMLAttributes<HTMLElement>, DFormControl`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dChecked | Manual control is selected | [boolean, Updater\<boolean\>?] | - |
| dDisabled | Whether to disable | boolean | false |
| dValue | Pass as an identifier in radio group | DValue  | - |
| onCheckedChange | Selected change callback | `(checked: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DRadioRef

```tsx
export type DRadioRef = HTMLInputElement;
```

### DRadioGroupProps

Extend `React.HTMLAttributes<HTMLDivElement>, DFormControl`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dValue | Manual control selection | [DValue, Updater\<DValue\>?] | - |
| dName | Single option `name` attribute | string | - |
| dDisabled | Whether to disable | boolean | false |
| dType | Radio group style | 'outline' \| 'fill' | - |
| dSize | Radio button size | 'smaller' \| 'larger' | - |
| dVertical | Radio group arranged vertically | boolean | false |
<!-- prettier-ignore-end -->

### DValue

```tsx
export type DValue = React.InputHTMLAttributes<HTMLInputElement>['value'];
```

### DFormControl

```tsx
export interface DFormControl {
  dFormControlName?: string;
}
```
