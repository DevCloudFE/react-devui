---
title: 警告提示
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
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dVisible | 是否可见，受控，默认为 `false` | - |  |
| dType | 设置警告提示类型 | - |  |
| dIcon | 设置图标 | - |  |
| dTitle | 设置标题 | - |  |
| dDescription | 设置描述 | - |  |
| dActions | 设置按钮组，`'close'` 表示关闭按钮 | `[]` |  |
| onClose | 关闭警告提示的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->
