---
title: 输入框
---

## API

### DInputProps

```tsx
interface DInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: string;
  dType?: React.HTMLInputTypeAttribute;
  dPrefix?: React.ReactNode;
  dSuffix?: React.ReactNode;
  dPassword?: boolean;
  dNumbetButton?: boolean;
  dClearable?: boolean;
  dSize?: DSize;
  dMax?: number;
  dMin?: number;
  dStep?: number;
  dInteger?: boolean;
  dPlaceholder?: string;
  dDisabled?: boolean;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (value: string) => void;
  onClear?: () => void;
  onPasswordChange?: (value: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dRef | 传递 ref | - |  |
| dFormControl | 支持表单 | - |  |
| dModel | 输入值，受控，默认为 `''` | - |  |
| dType | `input` 元素的 `type` 属性 | - |  |
| dPrefix | 前缀 | - |  |
| dSuffix | 后缀 | - |  |
| dPassword | 是否隐藏密码，受控，默认为 `true` | - |  |
| dNumbetButton | 是否显示增减按钮 | `true` |  |
| dClearable | 是否可清除 | `false` |  |
| dSize | 设置输入框大小 | - |  |
| dMax | 设置最大值 | - |  |
| dMin | 设置最小值 | - |  |
| dStep | 设置步数 | - |  |
| dInteger | 是否为整数 | `false` |  |
| dPlaceholder | 设置输入框占位文本 | - |  |
| dDisabled | 是否禁用 | `false` |  |
| dInputRender | 自定义输入元素 | - |  |
| onModelChange | 输入值变化的回调 | - |  |
| onClear | 清除输入值的回调 | - |  |
| onPasswordChange | 密码显/隐变化的回调 | - |  |
<!-- prettier-ignore-end -->
