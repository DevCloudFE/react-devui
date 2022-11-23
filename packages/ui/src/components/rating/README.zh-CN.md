---
title: 评分
---

## API

### DRatingProps

```tsx
interface DRatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dModel?: number;
  dName?: string;
  dDisabled?: boolean;
  dTotal?: number;
  dHalf?: boolean;
  dReadOnly?: boolean;
  dCustomIcon?: React.ReactNode | ((value: number) => React.ReactNode);
  dTooltip?: (value: number) => React.ReactNode;
  onModelChange?: (value: number) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dFormControl | 支持表单 | - |  |
| dModel | 评分，受控，默认为 `null` | - |  |
| dName | 设置 `input` 元素的 `name` 属性 | - |  |
| dDisabled | 是否禁用 | `false` |  |
| dTotal | 设置评分总数 | `5` |  |
| dHalf | 是否可以对半选择 | `false` |  |
| dReadOnly | 是否只读 | `false` |  |
| dCustomIcon | 自定义项目图标 | - |  |
| dTooltip | 设置项目提示 | - |  |
| onModelChange | 评分变化的回调 | - |  |
<!-- prettier-ignore-end -->
