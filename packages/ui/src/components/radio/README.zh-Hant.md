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
| dValue | 单选组中作为标识传递 | DValue  | - |
| onModelChange | 选中改变的回调 | `(checked: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DRadioRef

```tsx
type DRadioRef = HTMLInputElement;
```

### DRadioGroupProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制选择 | [DValue, Updater\<DValue\>?] | - |
| dName | 单选项的 `name` 属性 | string | - |
| dDisabled | 是否禁用 | boolean | false |
| dType | 单选组样式 | 'outline' \| 'fill' | - |
| dSize | 单选组按钮尺寸 | 'smaller' \| 'larger' | - |
| dVertical | 单选组垂直排布 | boolean | false |
| onModelChange | 选中项改变的回调 | `(checked: DValue) => void` | - |
<!-- prettier-ignore-end -->

### DValue

```tsx
type DValue = React.InputHTMLAttributes<HTMLInputElement>['value'];
```
