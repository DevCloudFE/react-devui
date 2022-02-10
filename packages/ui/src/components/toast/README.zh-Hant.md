---
title: 提示
---

## API

### DToastProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dType | 提示类型 | 'success' \| 'warning' \| 'error' \| 'info' | - |
| dIcon | 自定义提示图标 | React.ReactNode | - |
| dContent | 内容 | React.ReactNode | - |
| dDuration | 显示时长，为 0 时不会自动关闭 | number | 9.6 |
| dPlacement | 提示弹出方向 | 'top' \| 'bottom'  | 'top' |
| onClose | 提示关闭时的回调 | `() => void` | - |
| afterVisibleChange | 提示打开/关闭动画结束的回调 | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

### ToastService

```tsx
class ToastService {
  // 提示列表
  static readonly toasts: Toast[];

  // 打开提示
  static open(props: DToastProps): Toast;

  // 关闭提示
  static close(uniqueId: number): void;

  // 更新提示
  static rerender(uniqueId: number, props: DToastProps): void;

  // 关闭所有提示
  static closeAll(animation = true): void;
}
```

### Toast

```tsx
class Toast {
  // 唯一标识
  readonly uniqueId: number;

  // 关闭提示
  close(): void;

  // 更新提示
  rerender(props: DToastProps): void;
}
```
