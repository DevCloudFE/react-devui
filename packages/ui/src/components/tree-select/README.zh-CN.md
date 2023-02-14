---
title: 树选择框
---

## API

### DTreeSelectProps

```tsx
interface DTreeSelectProps<V extends DId, T extends DTreeItem<V>> extends React.HTMLAttributes<HTMLDivElement> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V | null | V[];
  dExpands?: V[];
  dVisible?: boolean;
  dPlaceholder?: string;
  dSize?: DSize;
  dLoading?: boolean;
  dSearchable?: boolean;
  dSearchValue?: string;
  dClearable?: boolean;
  dShowLine?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  dCustomSelected?: (select: T) => string;
  dCustomSearch?: {
    filter?: (value: string, item: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  dPopupClassName?: string;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  onSearchValueChange?: (value: string) => void;
  onClear?: () => void;
  onFirstExpand?: (value: T['value'], item: T) => void;
  onExpandsChange?: (ids: T['value'][], items: T[]) => void;
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
| dExpands | 展开项，受控，默认为 `[]` | - |  |
| dVisible | 是否可见，受控，默认为 `false` | - |  |
| dPlaceholder | 设置选择框占位文本 | - |  |
| dSize | 设置选择框大小 | - |  |
| dLoading | 加载中状态 | `false` |  |
| dSearchable | 是否可搜索 | `false` |  |
| dSearchValue | 搜索值，受控，默认为 `''` | - |  |
| dClearable | 是否可清除 | `false` |  |
| dShowLine | 是否显示连接线 | `false` |  |
| dDisabled | 是否禁用 | `false` |  |
| dMultiple | 是否为多选 | `false` |  |
| dOnlyLeafSelectable | 是否只能选择叶子节点 | `true` |  |
| dCustomItem | 自定义选项 | - |  |
| dCustomSelected | 自定义已选项 | - |  |
| dCustomSearch | 自定义搜索选项 | - |  |
| dPopupClassName | 向弹窗添加 `className` | - |  |
| dInputRender | 自定义输入元素 | - |  |
| onModelChange | 已选项变化的回调 | - |  |
| onVisibleChange | 显/隐的回调 | - |  |
| onSearchValueChange | 搜索值变化的回调 | - |  |
| onClear | 清除已选项的回调 | - |  |
| onFirstExpand | 第一次展开选项的回调 | - |  |
| onExpandsChange | 展开项变化的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->
