---
group: Data Entry
title: Checkbox
---

## API

### DCheckboxProps

Extend `React.HTMLAttributes<HTMLElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control is checked | [boolean, Updater\<boolean\>?] | - |
| dIndeterminate | Is it partially checked | boolean | false |
| disabled | Whether to disable | boolean | false |
| dValue | Pass as an identifier in checkbox group | any  | - |
| dInputProps | Attributes applied to the `input` element | React.InputHTMLAttributes\<HTMLInputElement\>  | - |
| dInputRef | Pass a `ref` to the `input` element | React.Ref\<HTMLInputElement\>  | - |
| onModelChange | Selected change callback | `(checked: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DCheckboxGroupProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control selection | [any[], Updater\<any[]\>?] | - |
| disabled | Whether to disable | boolean | false |
| dVertical | Vertical arrangement of checkbox group | boolean | false |
| onModelChange | Callback when the checked item is changed | `(values: any[]) => void` | - |
<!-- prettier-ignore-end -->

### DCheckboxGroupRef

```tsx
interface DCheckboxGroupRef {
  indeterminateProps: DCheckboxProps;
  indeterminateChecked: 'mixed' | boolean;
}
```
