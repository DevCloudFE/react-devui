---
group: Data Entry
title: TreeSelect
aria: combobox
compose: true
virtual-scroll: true
---

## API

### DTreeSelectProps

```tsx
interface DTreeSelectProps<V extends DId, T extends DTreeItem<V>> extends React.HTMLAttributes<HTMLDivElement> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V | null | V[];
  dExpands?: V[];
  dVisible?: boolean;
  dPlaceholder?: string;
  dSize?: DSize;
  dLoading?: boolean;
  dSearchable?: boolean;
  dSearchValue?: string;
  dClearable?: boolean;
  dShowLine?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  dCustomSelected?: (select: T) => string;
  dCustomSearch?: {
    filter?: (value: string, item: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  dPopupClassName?: string;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  onSearchValueChange?: (value: string) => void;
  onClear?: () => void;
  onFirstExpand?: (value: T['value'], item: T) => void;
  onExpandsChange?: (ids: T['value'][], items: T[]) => void;
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
| dExpands | Expand items, controlled, default `[]` | - | |
| dVisible | Visible, controlled, default `false` | - | |
| dPlaceholder | set the placeholder text of the selection box | - | |
| dSize | set the selection box size | - | |
| dLoading | Loading state | `false` | |
| dSearchable | Whether searchable | `false` | |
| dSearchValue | search value, controlled, default `''` | - | |
| dClearable | Can be cleared | `false` | |
| dShowLine | Whether to show connecting lines | `false` | |
| dDisabled | Whether to disable | `false` | |
| dMultiple | Whether it is multiple selection | `false` | |
| dOnlyLeafSelectable | Whether only leaf nodes can be selected | `true` | |
| dCustomItem | custom option | - | |
| dCustomSelected | Custom Selected | - | |
| dCustomSearch | Custom Search Options | - | |
| dPopupClassName | Add `className` to the popup | - | |
| dInputRender | custom input element | - | |
| onModelChange | Callback for selected option changes | - | |
| onVisibleChange | Visible/hidden callback | - | |
| onSearchValueChange | callback for search value change | - | |
| onClear | Clear the selected callback | - | |
| onFirstExpand | Callback for the first expanded option | - | |
| onExpandsChange | Callback for expanded item changes | - | |
| afterVisibleChange | Finished visible/hidden callback | - | |
<!-- prettier-ignore-end -->
