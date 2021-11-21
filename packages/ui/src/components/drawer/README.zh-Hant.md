---
title: 抽屉
---

屏幕边缘滑出的浮层面板。

## 何时使用

用户不必切换页面即可完成一些操作。

## API

### DDrawerProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dVisible | 抽屉是否可见 | boolean | false |
| dContainer | 抽屉的挂载节点, `false` 表示挂载在当前节点 | string \| HTMLElement \| `(() => HTMLElement \| null)` \| null \| false | - |
| dPlacement | 抽屉弹出方向 | 'top' \| 'right' \| 'bottom' \| 'left'  | 'right' |
| dWidth | 抽屉宽度 | number \| string | 400 |
| dHeight | 抽屉高度 | number \| string | 280 |
| dZIndex | 手动控制 `z-index` 的值 | number | - |
| dMask | 是否显示遮罩 | boolean | true |
| dMaskClosable | 点击遮罩关闭抽屉 | boolean | true |
| dHeader | 抽屉的页头 | React.ReactNode | - |
| dFooter | 抽屉的页脚 | React.ReactNode | - |
| dDestroy | 关闭后销毁节点 | boolean | false |
| dChildDrawer | 嵌套子抽屉 | React.ReactNode | - |
| onClose | 抽屉关闭时的回调 | `() => void` | - |
| afterVisibleChange | 抽屉打开/关闭动画结束的回调 | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DDrawerHeaderProps

等于 `Omit<DHeaderProps, 'onClose'>`。

### DHeaderProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dCloseIcon | 设置关闭按钮的图标， `null` 表示隐藏按钮 | React.ReactNode | - |
| dExtraIcons | 添加一些额外的操作按钮 | React.ReactNode[] | - |
| onClose | 点击关闭按钮的回调 | `() => void` | - |
<!-- prettier-ignore-end -->

### DDrawerFooterProps

继承 `DFooterProps`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| onOkClick | 点击确定按钮的回调，操作反馈取决于返回值，可通过 `Promise` 实现异步操作 | `() => void \| boolean \| Promise<void \| boolean>` | - |
| onCancelClick | 点击取消按钮的回调，操作反馈取决于返回值，可通过 `Promise` 实现异步操作 | `() => void \| boolean \| Promise<void \| boolean>` | - |
<!-- prettier-ignore-end -->

### DFooterProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dAlign | 设置按钮的水平位置 | 'left' \| 'center' \| 'right' | 'right' |
| dButtons | 自定义按钮，`'cancel'` 代表取消按钮，`'ok'` 代表确定按钮 | React.ReactNode[] | `['cancel', 'ok']` |
| dOkButtonProps | 为确定按钮提供额外的 `Props` | [DButtonProps](/components/Button#DButtonProps) | - |
| dCancelButtonProps | 为取消按钮提供额外的 `Props` | [DButtonProps](/components/Button#DButtonProps) | - |
| onOkClick | 点击确定按钮的回调 | `() => void` | - |
| onCancelClick | 点击取消按钮的回调 | `() => void` | - |
<!-- prettier-ignore-end -->
