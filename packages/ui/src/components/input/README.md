---
group: Data Entry
title: Input
compose: true
---

## API

### DInputProps

```tsx
interface DInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: string;
  dType?: React.HTMLInputTypeAttribute;
  dPrefix?: React.ReactNode;
  dSuffix?: React.ReactNode;
  dPassword?: boolean;
  dNumbetButton?: boolean;
  dClearable?: boolean;
  dSize?: DSize;
  dMax?: number;
  dMin?: number;
  dStep?: number;
  dInteger?: boolean;
  dPlaceholder?: string;
  dDisabled?: boolean;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (value: string) => void;
  onClear?: () => void;
  onPasswordChange?: (value: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dRef | pass ref | - | |
| dFormControl | Support Forms | - | |
| dModel | input value, controlled, default `''` | - | |
| dType | `type` attribute of `input` element | - | |
| dPrefix | prefix | - | |
| dSuffix | suffix | - | |
| dPassword | Whether to hide the password, controlled, default `true` | - | |
| dNumbetButton | Whether to display the increase and decrease buttons | `true` | |
| dClearable | Can be cleared | `false` | |
| dSize | set input box size | - | |
| dMax | Set maximum value | - | |
| dMin | set minimum value | - | |
| dStep | Set the number of steps | - | |
| dInteger | Whether it is an integer | `false` | |
| dPlaceholder | set the input box placeholder text | - | |
| dDisabled | Whether to disable | `false` | |
| dInputRender | custom input element | - | |
| onModelChange | Callback for input value change | - | |
| onClear | Callback for clearing input values | - | |
| onPasswordChange | callback for password display/invisibility | - | |
<!-- prettier-ignore-end -->
