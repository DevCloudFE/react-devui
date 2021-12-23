---
group: Data Entry
title: Input
---

The input box is the most basic component that receives user text input.

## When To Use

When the user needs to enter content.

## API

### DRadioProps

Extend `React.InputHTMLAttributes<HTMLInputElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Bind value | [string, Updater\<string\>?] | - |
| dSize | Set the size of the input box | 'smaller' \| 'larger' | - |
| onModelChange | Callback for binding value change | `(value: string) => void` | - |
<!-- prettier-ignore-end -->

### DInputRef

```tsx
type DInputRef = HTMLInputElement;
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
| dNumber | Is it a number input | boolean | false |
| dClearable | Can it be cleared | boolean | false |
| dClearIcon | Custom clear icon | React.ReactNode | - |
| dSize | Input size | 'smaller' \| 'larger' | - |
<!-- prettier-ignore-end -->
