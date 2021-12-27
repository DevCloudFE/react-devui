---
group: Data Entry
title: Textarea
---

Multi-line plain text edit control.

## When To Use

It is desirable to allow users to enter large amounts of free-form text, such as comments on comments or feedback forms.

## API

### DTextareaProps

Extend `React.InputHTMLAttributes<HTMLTextAreaElement>, DFormControl`, [DFormControl](/components/Form#DFormControl).

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Bind value | [string, Updater\<string\>?] | - |
| dRows | Set the number of rows, `'auto'` means automatic change, and can also pass the maximum and minimum values   | 'auto' \| { minRows?: number; maxRows?: number } | - |
| dResizable | Whether the size can be changed | boolean | true |
| dShowCount | Display the number of input words | boolean | `((num: number) => React.ReactNode)` | false |
| onModelChange | Callback for binding value change | `(value: string) => void` | - |
<!-- prettier-ignore-end -->

### DTextareaRef

```tsx
export type DTextareaRef = HTMLTextAreaElement;
```
