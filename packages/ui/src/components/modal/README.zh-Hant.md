---
title: 模态框
---

一个模态框

## 何时使用

用户不必切换页面即可完成一些操作。

## API

### DModalProps

<!-- prettier-ignore-start -->

| Property      | Description                 | Type                           | Default |
| ------------- | --------------------------- | ------------------------------ | ------- |
| dVisible      | 是否可见                    | [boolean, Updater\<boolean\>?] | -       |
| dWidth        | 宽度                        | string \| number               | 520px   |
| dZIndex       | 设置Modal的`z-index`        | number                         | -       |
| dMask         | 是否显示遮罩                | number \| string               | true    |
| dMaskClosable | 点击遮罩关闭模态框          | number                         | -       |
| style         | 添加自定义样式              | CSSProperties                  | -       |
| dAfterClose   | `Modal`完全关闭后的回调函数 | `() => void`                   | -       |

### DModalHeaderProps

等于 `Omit<DHeaderProps, 'onClose'>`.

### DHeaderProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->

| 参数        | 说明                                     | 类型              | 默认值 |
| ----------- | ---------------------------------------- | ----------------- | ------ |
| dCloseIcon  | 设置关闭按钮的图标， `null` 表示隐藏按钮 | React.ReactNode   | -      |
| dExtraIcons | 添加一些额外的操作按钮                   | React.ReactNode[] | -      |
| onClose     | 点击关闭按钮的回调                       | `() => void`      | -      |

<!-- prettier-ignore-end -->

### DModalFooterProps

Extend `DFooterProps`.

<!-- prettier-ignore-start -->

| Property      | Description                                                  | Type                                             | Default |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------ | ------- |
| okText        | 设置确定按钮文字                                             | string                                           | Ok      |
| cancelText    | 设置取消按钮文字                                             | string                                           | Cancel  |
| onOkClick     | 点击确定按钮的回调，操作反馈取决于返回值，可通过 `Promise` 实现异步操作 | `() => void \|boolean \|Promise<void \|boolean>` | -       |
| onCancelClick | 点击取消按钮的回调，操作反馈取决于返回值，可通过 `Promise` 实现异步操作 | `() => void \|boolean \|Promise<void \|boolean>` | -       |

### DFooterProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->

| Property           | Description                                              | Type                                            | Default            |
| ------------------ | -------------------------------------------------------- | ----------------------------------------------- | ------------------ |
| dAlign             | 设置按钮的水平位置                                       | 'left' \| 'center' \| 'right'                   | 'right'            |
| dButtons           | 自定义按钮，`'cancel'` 代表取消按钮，`'ok'` 代表确定按钮 | React.ReactNode[]                               | `['cancel', 'ok']` |
| dOkButtonProps     | 为确定按钮提供额外的 `Props`                             | [DButtonProps](/components/Button#DButtonProps) | -                  |
| dCancelButtonProps | 为取消按钮提供额外的 `Props`                             | [DButtonProps](/components/Button#DButtonProps) | -                  |
| onOkClick          | 点击确认按钮后的回调函数                                 | `() => void`                                    | -                  |
| onCancelClick      | 点击取消按钮后的回调函数                                 | `() => void`                                    | -                  |

<!-- prettier-ignore-end -->

### DElementSelector

```tsx
export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);
```

