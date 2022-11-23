---
group: Data Entry
title: Textarea
---

## API

### DTextareaProps

```tsx
interface DTextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  dFormControl?: DFormControl;
  dModel?: string;
  dRows?: 'auto' | { minRows?: number; maxRows?: number };
  dResizable?: boolean;
  dShowCount?: boolean | ((num: number) => React.ReactNode);
  onModelChange?: (value: string) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dFormControl | Support Forms | - | |
| dModel | input value, controlled, default `''` | - | |
| dRows | Set the number of rows | - | |
| dResizable | Resizable | `true` | |
| dShowCount | Whether to display the number of input characters, note: the length of the string is the number of `UTF-16` units | `false` | |
| onModelChange | Callback for input value change | - | |
<!-- prettier-ignore-end -->
