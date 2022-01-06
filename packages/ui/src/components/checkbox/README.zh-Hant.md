---
title: 多选组
---

多选组。

## 何时使用

在一个集合内，用户可以通过多选组组件进行一项或者多项选择。

## API

### DCheckboxProps

继承 `React.HTMLAttributes<HTMLElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制是否选中 | [boolean, Updater\<boolean\>?] | - |
| dIndeterminate | 是否为部分选中 | boolean | false |
| dDisabled | 是否禁用 | boolean | false |
| dValue | 多选组中作为标识传递 | any  | - |
| dInputProps | 应用于 `input` 元素的属性 | React.InputHTMLAttributes\<HTMLInputElement\>  | - |
| dInputRef | 将 `ref` 传递给 `input` 元素 | React.LegacyRef\<HTMLInputElement\>  | - |
| onModelChange | 选中改变的回调 | `(checked: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DCheckboxGroupProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制选择 | [any[], Updater\<any[]\>?] | - |
| dDisabled | 是否禁用 | boolean | false |
| dVertical | 多选组垂直排布 | boolean | false |
| dIndeterminateLabel | 部分选中的标签内容 | `(checked: boolean \| 'mixed') => React.ReactNode` | - |
| dIndeterminateRef | 部分选中的节点 | `(node: React.ReactNode) => void` | - |
| onModelChange | 选中项改变的回调 | `(values: any[]) => void` | - |
<!-- prettier-ignore-end -->
