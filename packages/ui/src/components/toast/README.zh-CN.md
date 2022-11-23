---
title: 提示
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
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dVisible | 是否可见，受控，默认为 `false` | - |  |
| dType | 设置提示类型 | - |  |
| dIcon | 设置图标 | - |  |
| dDuration | 设置多少秒自动关闭提示，鼠标移入会重置时间 | `2` |  |
| dPlacement | 设置提示位置 | `'top'` |  |
| dEscClosable | 是否可通过 Esc 关闭提示 | `true` |  |
| onClose | 关闭提示的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->
