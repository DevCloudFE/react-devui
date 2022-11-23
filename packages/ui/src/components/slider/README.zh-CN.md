---
title: 滑动输入条
---

## API

### DSliderProps

```tsx
interface DSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    inputLeft?: React.ForwardedRef<HTMLInputElement>;
    inputRight?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: number | [number, number];
  dMax?: number;
  dMin?: number;
  dStep?: number | null;
  dDisabled?: boolean;
  dMarks?: number | ({ value: number; label: React.ReactNode } | number)[];
  dVertical?: boolean;
  dReverse?: boolean;
  dRange?: boolean;
  dRangeMinDistance?: number;
  dRangeThumbDraggable?: boolean;
  dTooltipVisible?: boolean | [boolean?, boolean?];
  dCustomTooltip?: (value: number) => React.ReactNode;
  dInputRender?: [
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?,
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?
  ];
  onModelChange?: (value: any) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dRef | 传递 ref | - |  |
| dFormControl | 支持表单 | - |  |
| dModel | 值，受控，默认为 `dRange ? [0, 0] : 0` | - |  |
| dMax | 设置最大值 | `100` |  |
| dMin | 设置最小值 | `0` |  |
| dStep | 设置步数 | `1` |  |
| dDisabled | 是否禁用 | `false` |  |
| dMarks | 设置刻度标记 | - |  |
| dVertical | 是否垂直布局 | `false` |  |
| dReverse | 是否反置输入条 | `false` |  |
| dRange | 是否范围选择 | `false` |  |
| dRangeMinDistance | 设置最小范围 | - |  |
| dRangeThumbDraggable | 是否可拖拽输入条 | `false` |  |
| dTooltipVisible | 提示是否可见 | - |  |
| dCustomTooltip | 自定义提示 | - |  |
| dInputRender | 自定义输入元素 | - |  |
| onModelChange | 值变化的回调 | - |  |
<!-- prettier-ignore-end -->
