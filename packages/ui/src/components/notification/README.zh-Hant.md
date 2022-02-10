---
title: 通知
---

## API

### DNotificationProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dType | 通知类型 | 'success' \| 'warning' \| 'error' \| 'info' | - |
| dIcon | 自定义通知图标 | React.ReactNode | - |
| dTitle | 标题 | React.ReactNode | - |
| dDescription | 描述信息 | React.ReactNode | - |
| dDuration | 显示时长，为 0 时不会自动关闭 | number | 9.6 |
| dPlacement | 通知弹出方向 | 'left-top' \| 'right-top' \| 'left-bottom' \| 'right-bottom'  | 'right-top' |
| dClosable | 是否可关闭 | boolean | true |
| dCloseIcon | 自定义关闭图标 | React.ReactNode | - |
| dEscClosable | 按下Esc是否关闭 | boolean | true |
| onClose | 通知关闭时的回调 | `() => void` | - |
| afterVisibleChange | 通知打开/关闭动画结束的回调 | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

### NotificationService

```tsx
class NotificationService {
  // 通知列表
  static readonly notifications: Notification[];

  // 打开通知
  static open(props: DNotificationProps): Notification;

  // 关闭通知
  static close(uniqueId: number): void;

  // 更新通知
  static rerender(uniqueId: number, props: DNotificationProps): void;

  // 关闭所有通知
  static closeAll(animation = true): void;
}
```

### Notification

```tsx
class Notification {
  // 唯一标识
  readonly uniqueId: number;

  // 关闭通知
  close(): void;

  // 更新通知
  rerender(props: DNotificationProps): void;
}
```
