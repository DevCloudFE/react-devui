---
group: Feedback
title: Notification
---

Notification.

## When To Use

Global display notification reminder information.

## API

### DNotificationProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dType | Notification type | 'success' \| 'warning' \| 'error' \| 'info' | - |
| dIcon | Custom notification icon | React.ReactNode | - |
| dTitle | Title | React.ReactNode | - |
| dDescription | Description | React.ReactNode | - |
| dDuration | Display duration, will not be closed automatically when it is 0 | number | 9.6 |
| dPlacement | Notification pop-up direction | 'left-top' \| 'right-top' \| 'left-bottom' \| 'right-bottom'  | 'right-top' |
| dClosable | Can be closed | boolean | true |
| dCloseIcon | Customize the close icon | React.ReactNode | - |
| dEscClosable | Whether to close by pressing Esc | boolean | true |
| onClose | Callback when the notification is closed | `() => void` | - |
| afterVisibleChange | Callback to the end of the opening/closing animation | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

### NotificationService

```tsx
class NotificationService {
  // Notification list
  static readonly notifications: Notification[];

  // Open notification
  static open(props: DNotificationProps): Notification;

  // Close notification
  static close(uniqueId: number): void;

  // Update notification
  static rerender(uniqueId: number, props: DNotificationProps): void;

  // Close all notifications
  static closeAll(animation = true): void;
}
```

### Notification

```tsx
class Notification {
  // Uniquely identifies
  readonly uniqueId: number;

  // Close notification
  close(): void;

  // Update notification
  rerender(props: DNotificationProps): void;
}
```
