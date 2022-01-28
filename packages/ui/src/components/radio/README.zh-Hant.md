---
title: 单选组
---

单选组。

## 何时使用

用户要从一个数据集中选择单个选项，且能并排查看所有可选项。

## API

### DRadioProps

继承 `React.HTMLAttributes<HTMLElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制是否选中 | [boolean, Updater\<boolean\>?] | - |
| dDisabled | 是否禁用 | boolean | false |
| dValue | 单选组中作为标识传递 | any  | - |
| dInputProps | 应用于 `input` 元素的属性 | React.InputHTMLAttributes\<HTMLInputElement\>  | - |
| dInputRef | 将 `ref` 传递给 `input` 元素 | React.Ref\<HTMLInputElement\>  | - |
| onModelChange | 选中改变的回调 | `(checked: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DRadioGroupProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制选择 | [any, Updater\<any\>?] | - |
| dName | 单选项的 `name` 属性 | string | - |
| dDisabled | 是否禁用 | boolean | false |
| dType | 单选组样式 | 'outline' \| 'fill' | - |
| dSize | 单选组尺寸 | 'smaller' \| 'larger' | - |
| dVertical | 单选组垂直排布 | boolean | false |
| onModelChange | 选中项改变的回调 | `(value: any) => void` | - |
<!-- prettier-ignore-end -->
