---
group: Feedback
title: Alert
aria: alert
---

## API

### DAlertProps

```tsx
interface DAlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dVisible?: boolean;
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDescription?: React.ReactNode;
  dActions?: React.ReactNode[];
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dVisible | Visible, controlled, default `false` | - | |
| dType | set type | - | |
| dIcon | Settings icon | - | |
| dTitle | set title | - | |
| dDescription | set description | - | |
| dActions | set button group, `'close'` means close button | `[]` | |
| onClose | Callback to close the warning prompt | - | |
| afterVisibleChange | Finished visible/hidden callback | - | |
<!-- prettier-ignore-end -->
