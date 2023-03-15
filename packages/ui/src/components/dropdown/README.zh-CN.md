---
title: 下拉菜单
---

## API

### DDropdownProps

```tsx
interface DDropdownItem<ID extends DId> {
  id: ID;
  label: React.ReactNode;
  type: 'item' | 'group' | 'sub';
  icon?: React.ReactNode;
  disabled?: boolean;
  separator?: boolean;
  children?: DDropdownItem<ID>[];
}

interface DDropdownProps<ID extends DId, T extends DDropdownItem<ID>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dList: T[];
  dVisible?: boolean;
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dTrigger?: 'hover' | 'click';
  dArrow?: boolean;
  dZIndex?: number | string;
  onVisibleChange?: (visible: boolean) => void;
  onItemClick?: (id: T['id'], item: T) => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dVisible | 下拉菜单是否可见，受控，默认为 `false` | - |  |
| dPlacement | 设置下拉菜单位置 | `'bottom-right'` |  |
| dTrigger | 设置触发行为 | `'hover'` |  |
| dArrow | 是否展示箭头 | `false` |  |
| dZIndex | 设置下拉菜单的 `z-index` | - |  |
| onVisibleChange | 显/隐的回调 | - |  |
| onItemClick | 点击菜单项的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->
