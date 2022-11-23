---
group: Data Display
title: Tooltip
aria: tooltip
---

## API

### DTooltipProps

```tsx
interface DTooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dVisible?: boolean;
  dTrigger?: 'hover' | 'click';
  dContainer?: DRefExtra | false;
  dPlacement?: DPopupPlacement;
  dEscClosable?: boolean;
  dArrow?: boolean;
  dDistance?: number;
  dInWindow?: number | false;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dZIndex?: number | string;
  dTitle: React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dVisible | Whether the popup is visible, controlled, default `false` | - |  |
| dTrigger | Set trigger behavior | `'hover'` |  |
| dContainer | Set the parent container, `false` means `parentElement` of the element | - |  |
| dPlacement | Set popup position | `'top'` |  |
| dEscClosable | Whether the popup can be closed by Esc | `true` |  |
| dArrow | Whether to show arrows | `true` |  |
| dDistance | The distance between the popup and the trigger element | `10` |  |
| dInWindow | The minimum distance between the window border and the popup, `false` means that the popup is not forced to be in the window | `false` |  |
| dMouseEnterDelay | How many milliseconds to delay displaying the popup after the mouse is moved in | `150` |  |
| dMouseLeaveDelay | How many milliseconds to delay closing the popup after the mouse is moved out | `200` |  |
| dZIndex | Set the `z-index` of the popup | - |  |
| onVisibleChange | Callback for visible change | - |  |
| afterVisibleChange | Callback for complete visible change | - |  |
<!-- prettier-ignore-end -->
