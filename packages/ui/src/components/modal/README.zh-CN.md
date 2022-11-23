---
title: 对话框
---

## API

### DModalProps

```tsx
interface DModalProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dWidth?: number | string;
  dTop?: number | string;
  dZIndex?: number | string;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dEscClosable?: boolean;
  dSkipFirstTransition?: boolean;
  dDestroyAfterClose?: boolean;
  dType?: {
    type: 'success' | 'warning' | 'error' | 'info';
    title?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
  };
  dHeader?: React.ReactElement | string;
  dFooter?: React.ReactElement;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dVisible | 对话框是否可见，受控，默认为 `false` | - |  |
| dWidth | 设置对话框宽度 | `520` |  |
| dTop | 设置对话框距离窗口顶部的高度 | `100` |  |
| dZIndex | 设置对话框的 `z-index` | - |  |
| dMask | 是否显示遮罩层 | `true` |  |
| dMaskClosable | 点击遮罩层关闭对话框 | `true` |  |
| dEscClosable | 是否可通过 Esc 关闭对话框 | `true` |  |
| dSkipFirstTransition | 是否跳过第一次动画 | `true` |  |
| dDestroyAfterClose | 是否关闭对话框后销毁节点 | `true` |  |
| dType | 设置对话框类型 | - |  |
| dHeader | 设置页头 | - |  |
| dFooter | 设置页脚 | - |  |
| onClose | 关闭对话框的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->

### DModalHeaderProps

```tsx
interface DModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dActions?: React.ReactNode[];
  dCloseProps?: DButtonProps;
  onCloseClick?: () => void | false | Promise<void | false>;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dActions | 操作按钮，`'close'` 表示关闭按钮 | `['close']` |  |
| dCloseProps | 设置关闭按钮的 props | - |  |
| onCloseClick | 点击关闭按钮的回调 | - |  |
<!-- prettier-ignore-end -->

### DModalFooterProps

```tsx
interface DModalFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dAlign?: 'left' | 'center' | 'right';
  dActions?: React.ReactNode[];
  dCancelProps?: DButtonProps;
  dOkProps?: DButtonProps;
  onCancelClick?: () => void | false | Promise<void | false>;
  onOkClick?: () => void | false | Promise<void | false>;
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
