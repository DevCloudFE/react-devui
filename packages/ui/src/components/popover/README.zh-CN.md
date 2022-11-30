---
title: 弹出框
---

## API

### DPopoverProps

```tsx
interface DPopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dVisible?: boolean;
  dTrigger?: 'hover' | 'click';
  dContainer?: DRefExtra | false;
  dPlacement?: DPopupPlacement;
  dEscClosable?: boolean;
  dDestroyAfterClose?: boolean;
  dArrow?: boolean;
  dModal?: boolean;
  dDistance?: number;
  dInWindow?: number | false;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dZIndex?: number | string;
  dHeader?: React.ReactElement | string;
  dContent: React.ReactNode;
  dFooter?: React.ReactElement;
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
| dDestroyAfterClose | 是否关闭弹窗后销毁节点 | `false` |  |
| dArrow | 是否展示箭头 | `true` |  |
| dModal | 弹窗是否为模态 | `false` |  |
| dDistance | 弹窗与触发元素的距离 | `10` |  |
| dInWindow | 视窗边界与弹窗的最小距离， `false` 表示不强制弹窗在视窗内 | `false` |  |
| dMouseEnterDelay | 鼠标移入后延时多少毫秒显示弹窗 | `150` |  |
| dMouseLeaveDelay | 鼠标移出后延时多少毫秒关闭弹窗 | `200` |  |
| dZIndex | 设置弹窗的 `z-index` | - |  |
| dHeader | 设置页头 | - |  |
| dContent | 设置内容 | - |  |
| dFooter | 设置页脚 | - |  |
| onVisibleChange | 显/隐的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->

### DPopoverHeaderProps

```tsx
interface DPopoverHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dActions?: React.ReactNode[];
  dCloseProps?: DButtonProps;
  onCloseClick?: () => void | boolean | Promise<boolean>;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dActions | 操作按钮，`'close'` 表示关闭按钮 | `[]` |  |
| dCloseProps | 设置关闭按钮的 props | - |  |
| onCloseClick | 点击关闭按钮的回调 | - |  |
<!-- prettier-ignore-end -->

### DPopoverFooterProps

```tsx
interface DPopoverFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dAlign?: 'left' | 'center' | 'right';
  dActions?: React.ReactNode[];
  dCancelProps?: DButtonProps;
  dOkProps?: DButtonProps;
  onCancelClick?: () => void | boolean | Promise<boolean>;
  onOkClick?: () => void | boolean | Promise<boolean>;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dAlign | 设置按钮位置 | `'right'` |  |
| dActions | 操作按钮，`'cancel'` 表示取消按钮，`'ok'` 表示确认按钮 | `['cancel', 'ok']` |  |
| dCancelProps | 设置取消按钮的 props | - |  |
| dOkProps | 设置确认按钮的 props | - |  |
| onCancelClick | 点击取消按钮的回调，返回 `false` 时终止关闭窗口，支持 `Promise` | - |  |
| onOkClick | 点击确认按钮的回调，返回 `false` 时终止关闭窗口，支持 `Promise` | - |  |
<!-- prettier-ignore-end -->
