---
title: 选择框
---

## API

### DSelectProps

```tsx
interface DSelectItem<V extends DId> {
  label: string;
  value: V;
  disabled?: boolean;
  children?: DSelectItem<V>[];
}

interface DSelectProps<V extends DId, T extends DSelectItem<V>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V | null | V[];
  dVisible?: boolean;
  dPlaceholder?: string;
  dSize?: DSize;
  dLoading?: boolean;
  dSearchable?: boolean;
  dSearchValue?: string;
  dClearable?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  dCustomSelected?: (select: T) => string;
  dCustomSearch?: {
    filter?: (value: string, item: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  dCreateItem?: (value: string) => T | undefined;
  dPopupClassName?: string;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  onSearchValueChange?: (value: string) => void;
  onClear?: () => void;
  onCreateItem?: (item: T) => void;
  onScrollBottom?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dRef | 传递 ref | - |  |
| dFormControl | 支持表单 | - |  |
| dList | 数据列表 | - |  |
| dModel | 已选项，受控，默认为 `dMultiple ? [] : null` | - |  |
| dVisible | 是否可见，受控，默认为 `false` | - |  |
| dPlaceholder | 设置选择框占位文本 | - |  |
| dSize | 设置选择框大小 | - |  |
| dLoading | 加载中状态 | `false` |  |
| dSearchable | 是否可搜索 | `false` |  |
| dSearchValue | 搜索值，受控，默认为 `''` | - |  |
| dClearable | 是否可清除 | `false` |  |
| dDisabled | 是否禁用 | `false` |  |
| dMultiple | 是否为多选 | `false` |  |
| dCustomItem | 自定义选项 | - |  |
| dCustomSelected | 自定义已选项 | - |  |
| dCustomSearch | 自定义搜索选项 | - |  |
| dCreateItem | 设置创建选项 | - |  |
| dPopupClassName | 向弹窗添加 `className` | - |  |
| dInputRender | 自定义输入元素 | - |  |
| onModelChange | 已选项变化的回调 | - |  |
| onVisibleChange | 显/隐的回调 | - |  |
| onSearchValueChange | 搜索值变化的回调 | - |  |
| onClear | 清除已选项的回调 | - |  |
| onCreateItem | 创建选项的回调 | - |  |
| onScrollBottom | 滚动到底部的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->
