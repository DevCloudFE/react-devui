---
title: 时间选择框
---

## API

### DTimePickerProps

```tsx
interface DTimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    inputLeft?: React.ForwardedRef<HTMLInputElement>;
    inputRight?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: Date | null | [Date, Date];
  dFormat?: string;
  dVisible?: boolean;
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dOrder?: 'ascend' | 'descend' | false;
  dPlaceholder?: string | [string?, string?];
  dRange?: boolean;
  dSize?: DSize;
  dClearable?: boolean;
  dDisabled?: boolean;
  dConfigTime?: (
    unit: 'hour' | 'minute' | 'second',
    value: number,
    position: 'start' | 'end',
    current: [Date | null, Date | null]
  ) => { disabled?: boolean; hidden?: boolean };
  d12Hour?: boolean;
  dPopupClassName?: string;
  dInputRender?: [
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?,
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?
  ];
  onModelChange?: (date: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onClear?: () => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dRef | 传递 ref | - |  |
| dFormControl | 支持表单 | - |  |
| dModel | 已选时间，受控，默认为 `null` | - |  |
| dFormat | 格式化时间，参考 [dayjs](https://day.js.org/docs/en/display/format) | - |  |
| dVisible | 是否可见，受控，默认为 `false` | - |  |
| dPlacement | 设置弹窗位置 | `'bottom-left'` |  |
| dOrder | 对时间进行排序，`false` 表示不排序 | `'ascend'` |  |
| dPlaceholder | 设置选择框占位文本 | - |  |
| dRange | 是否范围选择 | `false` |  |
| dSize | 设置选择框大小 | - |  |
| dClearable | 是否可清除 | `false` |  |
| dDisabled | 是否禁用 | `false` |  |
| dConfigTime | 自定义时间选项 | - |  |
| d12Hour | 是否展示为 12 小时制 | `false` |  |
| dPopupClassName | 向弹窗添加 `className` | - |  |
| dInputRender | 自定义输入元素 | - |  |
| onModelChange | 已选时间变化的回调 | - |  |
| onVisibleChange | 显/隐的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
| onClear | 清除已选时间的回调 | - |  |
<!-- prettier-ignore-end -->
