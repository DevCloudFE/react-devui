---
group: Data Entry
title: Radio
---

## API

### DRadioProps

Extend `React.HTMLAttributes<HTMLElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control is selected | [boolean, Updater\<boolean\>?] | - |
| dDisabled | Whether to disable | boolean | false |
| dValue | Pass as an identifier in radio group | any  | - |
| dInputProps | Attributes applied to the `input` element | React.InputHTMLAttributes\<HTMLInputElement\>  | - |
| dInputRef | Pass a `ref` to the `input` element | React.Ref\<HTMLInputElement\>  | - |
| onModelChange | Selected change callback | `(checked: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DRadioGroupProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control selection | [any, Updater\<any\>?] | - |
| dName | Single option `name` attribute | string | - |
| dDisabled | Whether to disable | boolean | false |
| dType | Radio group style | 'outline' \| 'fill' | - |
| dSize | Radio button size | 'smaller' \| 'larger' | - |
| dVertical | Radio group arranged vertically | boolean | false |
| onModelChange | Callback when the selected item is changed | `(value: any) => void` | - |
<!-- prettier-ignore-end -->
