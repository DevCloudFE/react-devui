---
group: Data Entry
title: Rating
aria: radiobutton
---

## API

### DRatingProps

```tsx
interface DRatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dModel?: number;
  dName?: string;
  dDisabled?: boolean;
  dTotal?: number;
  dHalf?: boolean;
  dReadOnly?: boolean;
  dCustomIcon?: React.ReactNode | ((value: number) => React.ReactNode);
  dTooltip?: (value: number) => React.ReactNode;
  onModelChange?: (value: number) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dFormControl | Support Forms | - | |
| dModel | scoring, controlled, default `null` | - | |
| dName | Sets the `name` attribute of the `input` element | - | |
| dDisabled | Whether to disable | `false` | |
| dTotal | Set the total score | `5` | |
| dHalf | Whether to choose in half | `false` | |
| dReadOnly | Whether to read only | `false` | |
| dCustomIcon | Custom item icon | - | |
| dTooltip | Set Item Tips | - | |
| onModelChange | callback for score change | - | |
<!-- prettier-ignore-end -->
