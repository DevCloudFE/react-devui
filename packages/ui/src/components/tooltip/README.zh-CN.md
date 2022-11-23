---
title: 文字提示
---

## API

### DTooltipProps

```tsx
interface DTooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dVisible?: boolean;
  dTrigger?: 'hover' | 'click';
  dContainer?: DRefExtra | false;
  dPlacement?: DPopupPlacement;
  dEscClosable?: boolean;
  dArrow?: boolean;
  dDistance?: number;
  dInWindow?: number | false;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dZIndex?: number | string;
  dTitle: React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dVisible | 弹窗是否可见，受控，默认为 `false` | - |  |
| dTrigger | 设置触发行为 | `'hover'` |  |
| dContainer | 设置父容器，`false` 表示元素的 `parentElement` | - |  |
| dPlacement | 设置弹窗位置 | `'top'` |  |
| dEscClosable | 是否可通过 Esc 关闭弹窗 | `true` |  |
| dArrow | 是否展示箭头 | `true` |  |
| dDistance | 弹窗与触发元素的距离 | `10` |  |
| dInWindow | 视窗边界与弹窗的最小距离， `false` 表示不强制弹窗在视窗内 | `false` |  |
| dMouseEnterDelay | 鼠标移入后延时多少毫秒显示弹窗 | `150` |  |
| dMouseLeaveDelay | 鼠标移出后延时多少毫秒关闭弹窗 | `200` |  |
| dZIndex | 设置弹窗的 `z-index` | - |  |
| dTitle | 设置显示内容 | - |  |
| onVisibleChange | 显/隐的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->
