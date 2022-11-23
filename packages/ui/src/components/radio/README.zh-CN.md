---
title: 单选组
---

## API

### DRadioProps

```tsx
interface DRadioProps extends React.HTMLAttributes<HTMLElement> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: boolean;
  dDisabled?: boolean;
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
| dInputRender | 自定义输入元素 | - |  |
| onModelChange | 选中状态变化的回调 | - |  |
<!-- prettier-ignore-end -->

### DRadioGroupProps

```tsx
interface DRadioItem<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

interface DRadioGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dList: DRadioItem<V>[];
  dModel?: V | null;
  dName?: string;
  dDisabled?: boolean;
  dType?: 'outline' | 'fill';
  dSize?: DSize;
  dVertical?: boolean;
  onModelChange?: (value: V) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dFormControl | 支持表单 | - |  |
| dList | 数据列表 | - |  |
| dModel | 选中项，受控，默认为 `nth(dList, 0)?.value ?? null` | - |  |
| dName | 设置 `input` 元素的 `name` 属性 | - |  |
| dDisabled | 是否禁用 | `false` |  |
| dType | 设置单选组类型 | - |  |
| dSize | 设置单选项大小 | - |  |
| dVertical | 是否垂直布局 | `false` |  |
| onModelChange | 选中项变化的回调 | - |  |
<!-- prettier-ignore-end -->
