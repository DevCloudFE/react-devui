---
group: Data Entry
title: Cascader
aria: combobox
compose: true
virtual-scroll: true
---

## API

### DCascaderProps

```tsx
interface DCascaderItem<V extends DId> {
  label: string;
  value: V;
  loading?: boolean;
  disabled?: boolean;
  children?: DCascaderItem<V>[];
}

interface DCascaderProps<V extends DId, T extends DCascaderItem<V>> extends React.HTMLAttributes<HTMLDivElement> {
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
  onFirstFocus?: (value: T['value'], item: T) => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dRef | Pass ref | - |  |
| dFormControl | Support form | - |  |
| dList | List of data | - |  |
| dModel | Selected, controlled, default `dMultiple ? [] : null` | - |  |
| dVisible | Whether visible, controlled, default `false` | - |  |
| dPlaceholder | Set the select box placeholder text | - |  |
| dSize | Set selection box size | - |  |
| dLoading | Loading status | `false` |  |
| dSearchable | Is it searchable | `false` |  |
| dSearchValue | search value, controlled, default is `''` | - |  |
| dClearable | Is it clearable | `false` |  |
| dDisabled | Whether to disable | `false` |  |
| dMultiple | Is it multiple choice | `false` |  |
| dOnlyLeafSelectable | Whether only leaf nodes can be selected | `true` |  |
| dCustomItem | custom options | - |  |
| dCustomSelected | Customize selected | - |  |
| dCustomSearch | custom search options | - |  |
| dPopupClassName | Add `className` to the popup | - |  |
| dInputRender | custom input element | - |  |
| onModelChange | Callback for changed options | - |  |
| onVisibleChange | explicit/implicit callback | - |  |
| onSearchValueChange | Callback for search value changes | - |  |
| onClear | Clear selected callback | - |  |
| onFirstFocus | Callback for the first time an option is focused | - |  |
| afterVisibleChange | Completion of explicit/implicit callbacks | - |  |
<!-- prettier-ignore-end -->
