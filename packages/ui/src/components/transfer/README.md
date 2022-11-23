---
group: Data Entry
title: Transfer
virtual-scroll: true
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dFormControl | Support Forms | - | |
| dList | data list | - | |
| dModel | Right option, controlled, default `[]` | - | |
| dSelected | Check option, controlled, default `[]` | - | |
| dTitle | set title | - | |
| dActions | set button group, `'left'` means left button, `'right'` means right button | `['right', 'left']` | |
| dLoading | Loading state | `[false, false]` | |
| dSearchable | Whether searchable | `false` | |
| dSearchValue | search value, controlled, default `['', '']` | - | |
| dDisabled | Whether to disable | `false` | |
| dCustomItem | custom option | - | |
| dCustomSearch | Custom Search Options | - | |
| onModelChange | Callback for right option change | - | |
| onSelectedChange | Callback for selection change | - | |
| onSearchValueChange | callback for search value change | - | |
| onScrollBottom | Callback for scrolling to the bottom | - | |
<!-- prettier-ignore-end -->
