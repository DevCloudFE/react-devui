---
group: Data Entry
title: Slider
aria: slider
---

## API

### DSliderProps

```tsx
interface DSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    inputLeft?: React.ForwardedRef<HTMLInputElement>;
    inputRight?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: number | [number, number];
  dMax?: number;
  dMin?: number;
  dStep?: number | null;
  dDisabled?: boolean;
  dMarks?: number | ({ value: number; label: React.ReactNode } | number)[];
  dVertical?: boolean;
  dReverse?: boolean;
  dRange?: boolean;
  dRangeMinDistance?: number;
  dRangeThumbDraggable?: boolean;
  dTooltipVisible?: boolean | [boolean?, boolean?];
  dCustomTooltip?: (value: number) => React.ReactNode;
  dInputRender?: [
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?,
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?
  ];
  onModelChange?: (value: any) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dRef | pass ref | - | |
| dFormControl | Support Forms | - | |
| dModel | value, controlled, default `dRange ? [0, 0] : 0` | - | |
| dMax | set maximum value | `100` | |
| dMin | set minimum value | `0` | |
| dStep | Set the number of steps | `1` | |
| dDisabled | Whether to disable | `false` | |
| dMarks | set tick marks | - | |
| dVertical | whether vertical layout | `false` | |
| dReverse | Whether to reverse the input bar | `false` | |
| dRange | Whether range selection | `false` | |
| dRangeMinDistance | set minimum range | - | |
| dRangeThumbDraggable | Whether the input bar can be dragged | `false` | |
| dTooltipVisible | Whether tooltip is visible | - | |
| dCustomTooltip | Custom Tooltip | - | |
| dInputRender | custom input element | - | |
| onModelChange | Callback for value change | - | |
<!-- prettier-ignore-end -->
