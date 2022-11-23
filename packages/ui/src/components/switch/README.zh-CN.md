---
title: 开关
---

## API

### DSwitchProps

```tsx
interface DSwitchProps extends React.HTMLAttributes<HTMLElement> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: boolean;
  dLabelPlacement?: 'left' | 'right';
  dStateContent?: [React.ReactNode, React.ReactNode];
  dDisabled?: boolean;
  dLoading?: boolean;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (checked: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dRef | 传递 ref | - |  |
| dFormControl | 支持表单 | - |  |
| dModel | 开关状态，受控，默认为 `''` | - |  |
| dLabelPlacement | 标签位置 | `'right'` |  |
| dStateContent | 设置不同状态的显示内容 | - |  |
| dDisabled | 是否禁用 | `false` |  |
| dLoading | 加载中状态 | `false` |  |
| dInputRender | 自定义输入元素 | - |  |
| onModelChange | 开关状态变化的回调 | - |  |
<!-- prettier-ignore-end -->
