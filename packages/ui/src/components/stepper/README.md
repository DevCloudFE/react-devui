---
group: Navigation
title: Stepper
---

## API

### DStepperProps

```tsx
interface DStepperItem {
  step?: number;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: 'completed' | 'active' | 'wait' | 'error';
}

interface DStepperProps<T extends DStepperItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dActive?: number;
  dPercent?: number;
  dVertical?: boolean;
  dIconSize?: number;
  dLabelBottom?: boolean;
  dClickable?: boolean;
  onItemClick?: (step: number, item: T) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | List of data | - |  |
| dActive | Active step, default `dList[0].step ?? 1` | - |  |
| dPercent | Set the progress of the current step | - |  |
| dVertical | Set vertical display | `false` |  |
| dIconSize | Set step icon size | `36` |  |
| dLabelBottom | Whether the step label is located below the icon | `false` |  |
| dClickable | Whether the step is clickable | `false` |  |
| onItemClick | Callback for the click step | - |  |
<!-- prettier-ignore-end -->
