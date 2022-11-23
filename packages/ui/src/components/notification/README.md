---
group: Feedback
title: Notification
aria: alert
---

## API

### DNotificationProps

```tsx
interface DNotificationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dVisible: boolean;
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDescription?: React.ReactNode;
  dDuration?: number;
  dPlacement?: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom';
  dActions?: React.ReactNode[];
  dEscClosable?: boolean;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dVisible | Visible, controlled, default `false` | - | |
| dType | set notification type | - | |
| dIcon | Settings icon | - | |
| dTitle | set title | - | |
| dDescription | set description | - | |
| dDuration | Set how many seconds to automatically close the notification, the mouse will reset the time | `9.6` | |
| dPlacement | Set notification position | `'right-top'` | |
| dActions | set button group, `'close'` means close button | `['close']` | |
| dEscClosable | Whether the notification can be closed by Esc | `true` | |
| onClose | Callback for closing notifications | - | |
| afterVisibleChange | Finished visible/hidden callback | - | |
<!-- prettier-ignore-end -->
