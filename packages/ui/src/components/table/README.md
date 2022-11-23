---
group: Data Display
title: Table
aria: table
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dBorder | Whether to display the border | `false` |  |
| dEllipsis | Text is automatically omitted | `false` |  |
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dWidth | set length | - |  |
| dSort | set sort | - |  |
| dActions | Set button group | `[]` |  |
| dFixed | set fixed position | - |  |
| dAlign | set content location | `'left'` |  |
| dFixed | Text is automatically omitted | `false` |  |
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dWidth | set length | - |  |
| dFixed | set fixed position | - |  |
| dAlign | set content location | `'left'` |  |
| dFixed | Text is automatically omitted | `false` |  |
| dNowrap | Content does not wrap | `false` |  |
<!-- prettier-ignore-end -->

### DTableEmptyProps

```tsx
interface DTableEmptyProps extends React.HTMLAttributes<HTMLTableRowElement> {
  dColSpan?: number;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dColSpan | Set `colSpan` | - |  |
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dSelected | Take options, controlled, default `dMultiple ? [] : null` | - |  |
| dVisible | Whether visible, controlled, default is `false` | - |  |
| dLoading | Loading status | `false` |  |
| dSearchable | Is it searchable | `false` |  |
| dSearchValue | search value, controlled, default is `''` | - |  |
| dMultiple | Is it multiple choice | `false` |  |
| dCustomItem | custom options | - |  |
| dCustomSearch | custom search options | - |  |
| dPopupClassName | Add `className` to the popup | - |  |
| onSelectedChange | Callback with options changed | - |  |
| onVisibleChange | explicit/implicit callback | - |  |
| onSearchValueChange | Callback for search value changes | - |  |
| onScrollBottom | Scroll to bottom callback | - |  |
| afterVisibleChange | Completion of explicit/implicit callbacks | - |  |
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dValue | search value, controlled, default is `''` | - |  |
| dVisible | Whether visible, controlled, default is `false` | - |  |
| dPopupClassName | Add `className` to the popup | - |  |
| onValueChange | Callback for search value changes | - |  |
| onVisibleChange | explicit/implicit callback | - |  |
| afterVisibleChange | Completion of explicit/implicit callbacks | - |  |
<!-- prettier-ignore-end -->

### DTableExpandProps

```tsx
interface DTableExpandProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dExpand?: boolean;
  onExpandChange?: (expand: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dExpand | Whether to expand, controlled, default is `false` | - |  |
| onExpandChange | Callback for expansion state changes | - |  |
<!-- prettier-ignore-end -->
