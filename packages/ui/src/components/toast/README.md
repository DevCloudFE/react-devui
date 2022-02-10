---
group: Feedback
title: Toast
---

## API

### DToastProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dType | Toast type | 'success' \| 'warning' \| 'error' \| 'info' | - |
| dIcon | Custom toast icon | React.ReactNode | - |
| dContent | Content | React.ReactNode | - |
| dDuration | Display duration, will not be closed automatically when it is 0 | number | 9.6 |
| dPlacement | Toast pop-up direction | 'top' \| 'bottom'  | 'top' |
| onClose | Callback when the toast is closed | `() => void` | - |
| afterVisibleChange | Callback to the end of the opening/closing animation | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

### ToastService

```tsx
class ToastService {
  // Toast list
  static readonly toasts: Toast[];

  // Open toast
  static open(props: DToastProps): Toast;

  // Close toast
  static close(uniqueId: number): void;

  // Update toast
  static rerender(uniqueId: number, props: DToastProps): void;

  // Close all toasts
  static closeAll(animation = true): void;
}
```

### Toast

```tsx
class Toast {
  // Uniquely identifies
  readonly uniqueId: number;

  // Close toast
  close(): void;

  // Update toast
  rerender(props: DToastProps): void;
}
```
