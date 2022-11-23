---
group: Navigation
title: Dropdown
aria: menubutton
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
  dCloseOnClick?: boolean;
  dZIndex?: number | string;
  onVisibleChange?: (visible: boolean) => void;
  onItemClick?: (id: T['id'], item: T) => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | List of data | - |  |
| dVisible | Whether the popover is visible, controlled, default `false` | - |  |
| dPlacement | Set dropdown position | `'bottom-right'` |  |
| dTrigger | Set trigger behavior | `'hover'` |  |
| dArrow | Whether to show arrows | `false` |  |
| dCloseOnClick | Close the dropdown when the menu item is clicked | `true` |  |
| dZIndex | Set the `z-index` of the dropdown | - |  |
| onVisibleChange | Callback for visible change | - |  |
| onItemClick | Callback for menu item click | - |  |
| afterVisibleChange | Callback for complete visible change | - |  |
<!-- prettier-ignore-end -->
