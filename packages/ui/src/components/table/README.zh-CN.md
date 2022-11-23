---
title: 表格
---

## API

### DTableProps

```tsx
interface DTableProps extends React.HTMLAttributes<HTMLDivElement> {
  dBorder?: boolean;
  dEllipsis?: boolean;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dBorder | 是否显示边框 | `false` |  |
| dEllipsis | 文字自动省略 | `false` |  |
<!-- prettier-ignore-end -->

### DTableThProps

```tsx
interface DTableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  dWidth?: number | string;
  dSort?: {
    options?: ('ascend' | 'descend' | null)[];
    active?: 'ascend' | 'descend' | null;
    onSort?: (order: 'ascend' | 'descend' | null) => void;
  };
  dActions?: React.ReactNode[];
  dFixed?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  dAlign?: 'left' | 'right' | 'center';
  dEllipsis?: boolean;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dWidth | 设置长度 | - |  |
| dSort | 设置排序 | - |  |
| dActions | 设置按钮组 | `[]` |  |
| dFixed | 设置固定位置 | - |  |
| dAlign | 设置内容位置 | `'left'` |  |
| dFixed | 文字自动省略 | `false` |  |
<!-- prettier-ignore-end -->

### DTableTdProps

```tsx
interface DTableTdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  dWidth?: number | string;
  dFixed?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  dAlign?: 'left' | 'right' | 'center';
  dEllipsis?: boolean;
  dNowrap?: boolean;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dWidth | 设置长度 | - |  |
| dFixed | 设置固定位置 | - |  |
| dAlign | 设置内容位置 | `'left'` |  |
| dFixed | 文字自动省略 | `false` |  |
| dNowrap | 内容不换行 | `false` |  |
<!-- prettier-ignore-end -->

### DTableEmptyProps

```tsx
interface DTableEmptyProps extends React.HTMLAttributes<HTMLTableRowElement> {
  dColSpan?: number;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dColSpan | 设置 `colSpan` | - |  |
<!-- prettier-ignore-end -->

### DTableFilterProps

```tsx
interface DTableFilterItem<V extends DId> {
  label: string;
  value: V;
  disabled?: boolean;
}

interface DTableFilterProps<V extends DId, T extends DTableFilterItem<V>> extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dList: T[];
  dSelected?: V | null | V[];
  dVisible?: boolean;
  dLoading?: boolean;
  dSearchable?: boolean;
  dSearchValue?: string;
  dMultiple?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  dCustomSearch?: {
    filter?: (value: string, item: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  dPopupClassName?: string;
  onSelectedChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  onSearchValueChange?: (value: string) => void;
  onScrollBottom?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dSelected | 已选项，受控，默认为 `dMultiple ? [] : null` | - |  |
| dVisible | 是否可见，受控，默认为 `false` | - |  |
| dLoading | 加载中状态 | `false` |  |
| dSearchable | 是否可搜索 | `false` |  |
| dSearchValue | 搜索值，受控，默认为 `''` | - |  |
| dMultiple | 是否为多选 | `false` |  |
| dCustomItem | 自定义选项 | - |  |
| dCustomSearch | 自定义搜索选项 | - |  |
| dPopupClassName | 向弹窗添加 `className` | - |  |
| onSelectedChange | 已选项变化的回调 | - |  |
| onVisibleChange | 显/隐的回调 | - |  |
| onSearchValueChange | 搜索值变化的回调 | - |  |
| onScrollBottom | 滚动到底部的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->

### DTableSearchProps

```tsx
interface DTableSearchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dValue?: string;
  dVisible?: boolean;
  dPopupClassName?: string;
  onValueChange?: (value: string) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dValue | 搜索值，受控，默认为 `''` | - |  |
| dVisible | 是否可见，受控，默认为 `false` | - |  |
| dPopupClassName | 向弹窗添加 `className` | - |  |
| onValueChange | 搜索值变化的回调 | - |  |
| onVisibleChange | 显/隐的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->

### DTableExpandProps

```tsx
interface DTableExpandProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dExpand?: boolean;
  onExpandChange?: (expand: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dExpand | 是否展开，受控，默认为 `false` | - |  |
| onExpandChange | 展开状态变化的回调 | - |  |
<!-- prettier-ignore-end -->
