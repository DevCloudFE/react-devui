---
title: 模态框
---

一个模态框

## 何时使用

用户不必切换页面即可完成一些操作。

## API

### DModalProps

<!-- prettier-ignore-start -->

| Property     | Description                 | Type                           | Default |
| ------------ | --------------------------- | ------------------------------ | ------- |
| visible      | 是否可见                    | [boolean, Updater\<boolean\>?] | -       |
| title        | 标题                        | string \| ReactNode            | -       |
| width        | 宽度                        | string \| number               | 520px   |
| zIndex       | 设置Modal的`z-index`        | number                         | -       |
| mask         | 是否显示遮罩                | number \| string               | true    |
| maskClosable | 点击遮罩关闭模态框          | number                         | -       |
| style        | 添加自定义样式              | CSSProperties                  | -       |
| okText       | 确认按钮文字                | string                         | Ok      |
| cancelText   | 取消按钮文字                | string                         | Cancel  |
| afterClose   | `Modal`完全关闭后的回调函数 | `() => void`                   | -       |
| onOk         | 点击确认按钮后的回调函数    | `() => void`                   | -       |
| onCancel     | 点击取消按钮后的回调函数    | `() => void`                   | -       |

