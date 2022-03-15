---
title: 评分
---

## API

### DRatingProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制值 | [number, Updater\<number\>?] | - |
| dName | 单选项的 `name` 属性 | string | - |
| dTotal | 评分数 | number | 5 |
| dHalf | 是否允许半选 | boolean | false |
| disabled | 是否禁用 | boolean | false |
| dReadOnly | 是否只读 | boolean | false |
| dCustomIcon | 自定义显示 | React.ReactNode \| `((value: number) => React.ReactNode)` | - |
| dTooltip | 设置提示 | `(value: number) => React.ReactNode` | - |
| onModelChange | 选中项改变的回调 | `(value: number) => void` | - |
<!-- prettier-ignore-end -->
