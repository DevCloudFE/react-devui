---
group: Data Entry
title: Select
aria: combobox
compose: true
virtual-scroll: true
---

## API

### DSelectProps

```tsx
interface DSelectItem<V extends DId> {
  label: string;
  value: V;
  disabled?: boolean;
  children?: DSelectItem<V>[];
}

interface DSelectProps<V extends DId, T extends DSelectItem<V>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V | null | V[];
  dVisible?: boolean;
  dPlaceholder?: string;
  dSize?: DSize;
  dLoading?: boolean;
  dSearchable?: boolean;
  dSearchValue?: string;
  dClearable?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  dCustomSelected?: (select: T) => string;
  dCustomSearch?: {
    filter?: (value: string, item: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  dCreateItem?: (value: string) => T | undefined;
  dPopupClassName?: string;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  onSearchValueChange?: (value: string) => void;
  onClear?: () => void;
  onCreateItem?: (item: T) => void;
  onScrollBottom?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dRef | pass ref | - | |
| dFormControl | Support Forms | - | |
| dList | data list | - | |
| dModel | selected, controlled, default `dMultiple ? [] : null` | - | |
| dVisible | Visible, controlled, default `false` | - | |
| dPlaceholder | set the placeholder text of the selection box | - | |
| dSize | set the selection box size | - | |
| dLoading | Loading state | `false` | |
| dSearchable | Whether searchable | `false` | |
| dSearchValue | search value, controlled, default `''` | - | |
| dClearable | Can be cleared | `false` | |
| dDisabled | Whether to disable | `false` | |
| dMultiple | Whether it is multiple selection | `false` | |
| dCustomItem | custom option | - | |
| dCustomSelected | Custom Selected | - | |
| dCustomSearch | Custom Search Options | - | |
| dCreateItem | Set creation options | - | |
| dPopupClassName | Add `className` to the popup | - | |
| dInputRender | custom input element | - | |
| onModelChange | Callback for selected option changes | - | |
| onVisibleChange | Visible/hidden callback | - | |
| onSearchValueChange | callback for search value change | - | |
| onClear | Clear the selected callback | - | |
| onCreateItem | Callback for creating item | - | |
| onScrollBottom | Callback for scrolling to the bottom | - | |
| afterVisibleChange | Finished visible/hidden callback | - | |
<!-- prettier-ignore-end -->
