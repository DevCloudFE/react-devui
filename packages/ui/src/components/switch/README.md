---
group: Data Entry
title: Switch
---

Switch.

## When To Use

Switch on/off status.

## API

### DSwitchProps

Extend `React.HTMLAttributes<HTMLElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manually control on/off status | [boolean, Updater\<boolean\>?] | - |
| dLabelPlacement | Label placement | 'left' \| 'right' | 'right' |
| dStateContent | Status content | [React.ReactNode, React.ReactNode] | - |
| dLoading | Loading | boolean | false |
| dDisabled | Whether to disable | boolean | false |
| dInputProps | Attributes applied to the `input` element | React.InputHTMLAttributes\<HTMLInputElement\>  | - |
| dInputRef | Pass a `ref` to the `input` element | React.Ref\<HTMLInputElement\>  | - |
| onModelChange | Callback for on/off status change | `(checked: boolean) => void` | - |
<!-- prettier-ignore-end -->
