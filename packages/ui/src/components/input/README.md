---
group: Data Entry
title: Input
---

The input box is the most basic component that receives user text input.

## When To Use

When the user needs to enter content.

## API

### DRadioProps

Extend `React.InputHTMLAttributes<HTMLInputElement>`, [DFormControl](/components/Form#DFormControl).

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dValue | Bind value | [string, Updater\<string\>?] | - |
| dSize | Set the size of the input box | 'smaller' \| 'larger' | - |
| onValueChange | Callback for binding value change | `(value: string) => void` | - |
<!-- prettier-ignore-end -->

### DInputRef

```tsx
export type DInputRef = HTMLInputElement;
```

### DInputAffixProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dPrefix | Input prefix | React.ReactNode | - |
| dSuffix | Input suffix | React.ReactNode | - |
| dDisabled | Whether to disable | boolean | false |
| dPassword | Is it a password input | boolean | false |
| dPasswordToggle | Whether the password input can switch the password display | boolean | true |
| dClearable | Can it be cleared | boolean | false |
| dClearIcon | Custom clear icon | React.ReactNode | - |
| dSize | Input size | 'smaller' \| 'larger' | - |
<!-- prettier-ignore-end -->
