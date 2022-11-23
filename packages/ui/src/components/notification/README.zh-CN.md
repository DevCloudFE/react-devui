---
title: 通知
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
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dVisible | 是否可见，受控，默认为 `false` | - |  |
| dType | 设置通知类型 | - |  |
| dIcon | 设置图标 | - |  |
| dTitle | 设置标题 | - |  |
| dDescription | 设置描述 | - |  |
| dDuration | 设置多少秒自动关闭通知，鼠标移入会重置时间 | `9.6` |  |
| dPlacement | 设置通知位置 | `'right-top'` |  |
| dActions | 设置按钮组，`'close'` 表示关闭按钮 | `['close']` |  |
| dEscClosable | 是否可通过 Esc 关闭通知 | `true` |  |
| onClose | 关闭通知的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->
