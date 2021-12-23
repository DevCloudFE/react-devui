---
group: Data Entry
title: Radio
---

Radio group.

## When To Use

The user needs to select a single option from a data set, and can view all the available options side by side.

## API

### DRadioProps

Extend `React.HTMLAttributes<HTMLElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control is selected | [boolean, Updater\<boolean\>?] | - |
| dDisabled | Whether to disable | boolean | false |
| dValue | Pass as an identifier in radio group | DValue  | - |
| onModelChange | Selected change callback | `(checked: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DRadioRef

```tsx
type DRadioRef = HTMLInputElement;
```

### DRadioGroupProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control selection | [DValue, Updater\<DValue\>?] | - |
| dName | Single option `name` attribute | string | - |
| dDisabled | Whether to disable | boolean | false |
| dType | Radio group style | 'outline' \| 'fill' | - |
| dSize | Radio button size | 'smaller' \| 'larger' | - |
| dVertical | Radio group arranged vertically | boolean | false |
| onModelChange | Callback when the selected item is changed | `(checked: DValue) => void` | - |
<!-- prettier-ignore-end -->

### DValue

```tsx
type DValue = React.InputHTMLAttributes<HTMLInputElement>['value'];
```
