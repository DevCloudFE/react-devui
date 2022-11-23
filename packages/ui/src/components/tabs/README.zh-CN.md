---
title: 页签面板
---

## API

### DTabsProps

```tsx
interface DTabItem<ID extends DId> {
  id: ID;
  title: React.ReactNode;
  panel: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
}

interface DTabsProps<ID extends DId, T extends DTabItem<ID>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dActive?: ID;
  dPlacement?: 'top' | 'right' | 'bottom' | 'left';
  dCenter?: boolean;
  dType?: 'wrap' | 'slider';
  dSize?: DSize;
  onActiveChange?: (id: T['id'], item: T) => void;
  onAddClick?: () => void;
  onClose?: (id: T['id'], item: T) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dActive | 激活步骤，受控，默认为可激活的第一项 | - |  |
| dPlacement | 设置页签排布 | `'top'` |  |
| dCenter | 是否居中显示 | `false` |  |
| dType | 设置页签类型 | - |  |
| dSize | 设置页签大小 | - |  |
| onActiveChange | 激活页签项改变的回调 | - |  |
| onAddClick | 点击添加按钮的回调，存在时显示添加按钮 | - |  |
| onClose | 点击页签项关闭按钮的回调 | - |  |
<!-- prettier-ignore-end -->
