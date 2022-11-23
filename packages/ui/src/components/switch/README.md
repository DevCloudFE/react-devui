---
group: Data Entry
title: Switch
aria: switch
---

## API

### DSwitchProps

```tsx
interface DSwitchProps extends React.HTMLAttributes<HTMLElement> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: boolean;
  dLabelPlacement?: 'left' | 'right';
  dStateContent?: [React.ReactNode, React.ReactNode];
  dDisabled?: boolean;
  dLoading?: boolean;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (checked: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dRef | pass ref | - | |
| dFormControl | Support Forms | - | |
| dModel | switch state, controlled, default `''` | - | |
| dLabelPlacement | label placement | `'right'` | |
| dStateContent | Set the display content of different states | - | |
| dDisabled | Whether to disable | `false` | |
| dLoading | Loading state | `false` | |
| dInputRender | custom input element | - | |
| onModelChange | Callback for switch state change | - | |
<!-- prettier-ignore-end -->
