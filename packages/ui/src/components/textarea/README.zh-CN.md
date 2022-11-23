---
title: 文本域
---

## API

### DTextareaProps

```tsx
interface DTextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  dFormControl?: DFormControl;
  dModel?: string;
  dRows?: 'auto' | { minRows?: number; maxRows?: number };
  dResizable?: boolean;
  dShowCount?: boolean | ((num: number) => React.ReactNode);
  onModelChange?: (value: string) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dFormControl | 支持表单 | - |  |
| dModel | 输入值，受控，默认为 `''` | - |  |
| dRows | 设置行数 | - |  |
| dResizable | 是否可调整大小 | `true` |  |
| dShowCount | 是否显示输入字符数量，注意：字符串长度是 `UTF-16` 单元数量 | `false` |  |
| onModelChange | 输入值变化的回调 | - |  |
<!-- prettier-ignore-end -->
