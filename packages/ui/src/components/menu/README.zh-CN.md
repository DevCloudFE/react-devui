---
title: 导航菜单
---

## API

### DMenuProps

```tsx
interface DMenuItem<ID extends DId> {
  id: ID;
  title: React.ReactNode;
  type: 'item' | 'group' | 'sub';
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: DMenuItem<ID>[];
}

interface DMenuProps<ID extends DId, T extends DMenuItem<ID>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dList: T[];
  dWidth?: string | number;
  dActive?: ID | null;
  dExpands?: ID[];
  dMode?: DMenuMode;
  dExpandOne?: boolean;
  dExpandTrigger?: 'hover' | 'click';
  onActiveChange?: (id: T['id'], item: T) => void;
  onExpandsChange?: (ids: T['id'][], items: T[]) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dWidth | 设置菜单宽度 | `'auto'` |  |
| dActive | 激活菜单项，受控，默认为 `null` | - |  |
| dExpands | 展开菜单项，受控，默认为 `[]` | - |  |
| dMode | 设置菜单展示模式 | `vertical` |  |
| dExpandOne | 同一层级至多展开一项 | `false` |  |
| dExpandTrigger | 触发展开的行为 | - |  |
| onActiveChange | 激活菜单项改变的回调 | - |  |
| onExpandsChange | 展开菜单项改变的回调 | - |  |
<!-- prettier-ignore-end -->
