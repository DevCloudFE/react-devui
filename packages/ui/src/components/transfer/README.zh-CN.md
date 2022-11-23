---
title: 穿梭框
---

## API

### DTransferProps

```tsx
interface DTransferItem<V extends DId> {
  label: string;
  value: V;
  disabled?: boolean;
}

interface DTransferProps<V extends DId, T extends DTransferItem<V>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V[];
  dSelected?: V[];
  dTitle?: [React.ReactNode?, React.ReactNode?];
  dActions?: React.ReactNode[];
  dLoading?: [boolean?, boolean?];
  dSearchable?: boolean;
  dSearchValue?: [string, string];
  dDisabled?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  dCustomSearch?: {
    filter?: (value: string, item: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  onModelChange?: (value: T['value'][], item: T[]) => void;
  onSelectedChange?: (value: T['value'][], item: T[]) => void;
  onSearchValueChange?: (value: [string, string]) => void;
  onScrollBottom?: (direction: 'left' | 'right') => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dFormControl | 支持表单 | - |  |
| dList | 数据列表 | - |  |
| dModel | 右侧选项，受控，默认为 `[]` | - |  |
| dSelected | 勾选项，受控，默认为 `[]` | - |  |
| dTitle | 设置标题 | - |  |
| dActions | 设置按钮组，`'left'` 表示左按钮，`'right'` 表示右按钮 | `['right', 'left']` |  |
| dLoading | 加载中状态 | `[false, false]` |  |
| dSearchable | 是否可搜索 | `false` |  |
| dSearchValue | 搜索值，受控，默认为 `['', '']` | - |  |
| dDisabled | 是否禁用 | `false` |  |
| dCustomItem | 自定义选项 | - |  |
| dCustomSearch | 自定义搜索选项 | - |  |
| onModelChange | 右侧选项变化的回调 | - |  |
| onSelectedChange | 勾选项变化的回调 | - |  |
| onSearchValueChange | 搜索值变化的回调 | - |  |
| onScrollBottom | 滚动到底部的回调 | - |  |
<!-- prettier-ignore-end -->
