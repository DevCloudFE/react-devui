---
title: 滑动输入条
---

## API

### DSliderSingleProps

继承 `DSliderBaseProps`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制值 | [number, Updater\<number\>?] | - |
| dRange | 是否范围选择 | false | false |
| dInputProps | 应用于 `input` 元素的属性 | React.InputHTMLAttributes\<HTMLInputElement\>  | - |
| dInputRef | 将 `ref` 传递给 `input` 元素 | React.Ref\<HTMLInputElement\>  | - |
| dTooltipVisible | 提示是否可见 | boolean  | - |
| onModelChange | 值改变的回调 | `(value: number) => void` | - |
<!-- prettier-ignore-end -->

### DSliderRangeProps

继承 `DSliderBaseProps`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制值 | [[number, number], Updater\<[number, number]\>?] | - |
| dRange | 是否范围选择 | true | false |
| dRangeMinDistance | 范围选择最小间距 | number | - |
| dRangeThumbDraggable | 范围选择轨道是否可拖拽 | boolean | false |
| dInputProps | 应用于 `input` 元素的属性 | [React.InputHTMLAttributes\<HTMLInputElement\>?, React.InputHTMLAttributes\<HTMLInputElement\>?]  | - |
| dInputRef | 将 `ref` 传递给 `input` 元素 | [React.Ref\<HTMLInputElement\>?, React.Ref\<HTMLInputElement\>?]  | - |
| dTooltipVisible | 提示是否可见 | [boolean?, boolean?]  | - |
| onModelChange | 值改变的回调 | `(value: [number, number]) => void` | - |
<!-- prettier-ignore-end -->

### DSliderBaseProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dMax |  最大值 | number | 100 |
| dMin | 最小值 | number | 0 |
| dStep | 步长，为 null 表示只能选择 `dMarks` 中的值 | number | null | 1 |
| dMarks | 刻度标记 | number | ({ value: number; label: React.ReactNode } | number)[] | - |
| dVertical | 是否垂直显示 | boolean | false |
| dReverse | 是否反置显示 | boolean | false |
| dDisabled | 是否禁用 | boolean | false |
| dCustomTooltip | 自定义提示 | `(value: number) => React.ReactNode` | - |
<!-- prettier-ignore-end -->
