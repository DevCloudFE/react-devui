---
group: Navigation
title: Tabs
aria: tabpanels
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | List of data | - |  |
| dActive | Active step, controlled, defaults to the first item that can be activated | - |  |
| dPlacement | Set tab layout | `'top'` |  |
| dCenter | Whether to display in the center | `false` |  |
| dType | Set tab type | - |  |
| dSize | Set tab size | - |  |
| onActiveChange | Callback for active tab item changes | - |  |
| onAddClick | Callback for clicking the add button, display the add button if it exists | - |  |
| onClose | Callback for clicking the close button of the tab item | - |  |
<!-- prettier-ignore-end -->
