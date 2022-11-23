---
group: Feedback
title: Toast
aria: alert
---

## API

### DToastProps

```tsx
interface DToastProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dDuration?: number;
  dPlacement?: 'top' | 'bottom';
  dEscClosable?: boolean;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dVisible | Visible, controlled, default `false` | - | |
| dType | set prompt type | - | |
| dIcon | Settings icon | - | |
| dDuration | Set how many seconds to automatically close the prompt, the mouse will reset the time | `2` | |
| dPlacement | Set tooltip position | `'top'` | |
| dEscClosable | Whether the prompt can be closed by Esc | `true` | |
| onClose | Callback for closing the prompt | - | |
| afterVisibleChange | Finished visible/hidden callback | - | |
<!-- prettier-ignore-end -->
