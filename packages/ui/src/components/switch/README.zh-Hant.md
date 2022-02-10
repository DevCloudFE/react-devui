---
title: 开关
---

## API

### DSwitchProps

继承 `React.HTMLAttributes<HTMLElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制开/关状态 | [boolean, Updater\<boolean\>?] | - |
| dLabelPlacement | 标签位置 | 'left' \| 'right' | 'right' |
| dStateContent | 状态内容 | [React.ReactNode, React.ReactNode] | - |
| dLoading | 是否加载中 | boolean | false |
| dDisabled | 是否禁用 | boolean | false |
| dInputProps | 应用于 `input` 元素的属性 | React.InputHTMLAttributes\<HTMLInputElement\>  | - |
| dInputRef | 将 `ref` 传递给 `input` 元素 | React.Ref\<HTMLInputElement\>  | - |
| onModelChange | 开/关状态改变的回调 | `(checked: boolean) => void` | - |
<!-- prettier-ignore-end -->
