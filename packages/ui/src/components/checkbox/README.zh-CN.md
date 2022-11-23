---
title: 多选组
---

## API

### DCheckboxProps

```tsx
interface DCheckboxProps extends React.HTMLAttributes<HTMLElement> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: boolean;
  dDisabled?: boolean;
  dIndeterminate?: boolean;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (checked: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dRef | 传递 ref | - |  |
| dFormControl | 支持表单 | - |  |
| dModel | 是否选中，受控，默认为 `false` | - |  |
| dDisabled | 是否禁用 | `false` |  |
| dIndeterminate | 设置状态为 `indeterminate` | `false` |  |
| dInputRender | 自定义输入元素 | - |  |
| onModelChange | 选中状态变化的回调 | - |  |
<!-- prettier-ignore-end -->
