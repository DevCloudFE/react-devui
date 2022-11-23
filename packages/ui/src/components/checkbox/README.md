---
group: Data Entry
title: Checkbox
aria: checkbox
---

## API

### DCheckboxProps

```tsx
interface DCheckboxProps extends React.HTMLAttributes<HTMLElement> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: boolean;
  dDisabled?: boolean;
  dIndeterminate?: boolean;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (checked: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dRef | Pass ref | - |  |
| dFormControl | Support form | - |  |
| dModel | Whether checked, controlled, default is `false` | - |  |
| dDisabled | Whether to disable | `false` |  |
| dIndeterminate | Set state to `indeterminate` | `false` |  |
| dInputRender | custom input element | - |  |
| onModelChange | Callback for checked state changes | - |  |
<!-- prettier-ignore-end -->
