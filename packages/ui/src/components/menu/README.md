---
group: Navigation
title: Menu
aria: menu
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | List of data | - |  |
| dWidth | Set menu width | `'auto'` |  |
| dActive | Active menu item, controlled, default `null` | - |  |
| dExpands | Expand menu item, controlled, default `[]` | - |  |
| dMode | Set menu display mode | `vertical` |  |
| dExpandOne | Expand at most one item at the same level | `false` |  |
| dExpandTrigger | The behavior that triggers the expansion | - |  |
| onActiveChange | Callback for active menu item changes | - |  |
| onExpandsChange | Callback for expand menu item changes | - |  |
<!-- prettier-ignore-end -->
