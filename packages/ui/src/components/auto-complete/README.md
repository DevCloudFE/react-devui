---
group: Other
title: AutoComplete
aria: combobox
compose: true
virtual-scroll: true
---

## API

### DAutoCompleteProps

```tsx
interface DAutoCompleteItem {
  value: string;
  disabled?: boolean;
  children?: DAutoCompleteItem[];
}

interface DAutoCompleteProps<T extends DAutoCompleteItem> extends React.HTMLAttributes<HTMLDivElement> {
  dList: T[];
  dVisible?: boolean;
  dLoading?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  onItemClick?: (value: string, item: T) => void;
  onScrollBottom?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | data list | - | |
| dVisible | Visible, controlled, default `false` | - | |
| dLoading | Loading state | `false` | |
| dCustomItem | custom option | - | |
| onVisibleChange | Visible/hidden callback | - | |
| onItemClick | Callback for clicked item | - | |
| onScrollBottom | Callback for scrolling to the bottom | - | |
| afterVisibleChange | Finished visible/hidden callback | - | |
<!-- prettier-ignore-end -->
