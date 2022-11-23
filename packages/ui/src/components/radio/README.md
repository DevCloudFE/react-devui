---
group: Data Entry
title: Radio
aria: radiobutton
---

## API

### DRadioProps

```tsx
interface DRadioProps extends React.HTMLAttributes<HTMLElement> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: boolean;
  dDisabled?: boolean;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (checked: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dRef | pass ref | - | |
| dFormControl | Support Forms | - | |
| dModel | Checked, controlled, default `false` | - | |
| dDisabled | Whether to disable | `false` | |
| dInputRender | custom input element | - | |
| onModelChange | Callback for selected state changes | - | |
<!-- prettier-ignore-end -->

### DRadioGroupProps

```tsx
interface DRadioItem<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

interface DRadioGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dList: DRadioItem<V>[];
  dModel?: V | null;
  dName?: string;
  dDisabled?: boolean;
  dType?: 'outline' | 'fill';
  dSize?: DSize;
  dVertical?: boolean;
  onModelChange?: (value: V) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dFormControl | Support Forms | - | |
| dList | data list | - | |
| dModel | selected item, controlled, default `nth(dList, 0)?.value ?? null` | - | |
| dName | Sets the `name` attribute of the `input` element | - | |
| dDisabled | Whether to disable | `false` | |
| dType | Set radio group type | - | |
| dSize | set the size of the single option | - | |
| dVertical | whether vertical layout | `false` | |
| onModelChange | Callback when the selected item changes | - | |
<!-- prettier-ignore-end -->
