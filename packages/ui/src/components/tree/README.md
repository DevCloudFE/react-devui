---
group: Data Entry
title: Tree
aria: treeview
virtual-scroll: true
---

## API

### DTreeProps

```tsx
interface DTreeItem<V extends DId> {
  label: string;
  value: V;
  loading?: boolean;
  disabled?: boolean;
  children?: DTreeItem<V>[];
}

interface DTreeProps<V extends DId, T extends DTreeItem<V>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V | null | V[];
  dHeight?: number;
  dExpands?: V[];
  dExpandAll?: boolean;
  dShowLine?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  onModelChange?: (value: any, item: any) => void;
  onFirstExpand?: (value: T['value'], item: T) => void;
  onExpandsChange?: (ids: T['value'][], items: T[]) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dFormControl | Support Forms | - | |
| dList | data list | - | |
| dModel | selected, controlled, default `dMultiple ? [] : null` | - | |
| dHeight | set list height | - | |
| dExpands | Expand items, controlled, default `dExpandAll ? initExpandAll : []` | - | |
| dExpandAll | Whether to expand all | `false` | |
| dShowLine | Whether to show connecting lines | `false` | |
| dDisabled | Whether to disable | `false` | |
| dMultiple | Whether it is multiple selection | `false` | |
| dOnlyLeafSelectable | Whether only leaf nodes can be selected | `true` | |
| dCustomItem | custom option | - | |
| onModelChange | Callback for selected option changes | - | |
| onFirstExpand | Callback for the first expanded option | - | |
| onExpandsChange | Callback for expanded item changes | - | |
<!-- prettier-ignore-end -->
