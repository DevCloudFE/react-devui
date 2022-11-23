---
group: Data Entry
title: DatePicker
compose: true
---

## API

### DDatePickerProps

```tsx
interface DDatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    inputLeft?: React.ForwardedRef<HTMLInputElement>;
    inputRight?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: Date | null | [Date, Date];
  dFormat?: string;
  dVisible?: boolean;
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dOrder?: 'ascend' | 'descend' | null;
  dPlaceholder?: string | [string?, string?];
  dRange?: boolean;
  dSize?: DSize;
  dClearable?: boolean;
  dDisabled?: boolean;
  dPresetDate?: Record<string, () => Date | [Date, Date]>;
  dConfigDate?: (date: Date, position: 'start' | 'end', current: [Date | null, Date | null]) => { disabled?: boolean };
  dShowTime?: boolean | Pick<DTimePickerProps, 'd12Hour' | 'dConfigTime'>;
  dPopupClassName?: string;
  dInputRender?: [
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?,
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?
  ];
  onModelChange?: (date: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dRef | pass ref | - |  |
| dFormControl | support form | - |  |
| dModel | Selected date, controlled, default `null` | - |  |
| dFormat | Format date, refer to [dayjs](https://day.js.org/docs/en/display/format) | - |  |
| dVisible | Whether visible, controlled, default is `false` | - |  |
| dPlacement | Set popup position | `'bottom-left'` |  |
| dOrder | Sort the dates, `false` means no sorting | `'ascend'` |  |
| dPlaceholder | Set the select box placeholder text | - |  |
| dRange | Whether to choose the range | `false` |  |
| dSize | Set selection box size | - |  |
| dClearable | Is it clearable | `false` |  |
| dDisabled | Whether to disable | `false` |  |
| dPresetDate | default date value | - |  |
| dConfigDate | custom date options | - |  |
| dShowTime | Whether to show time selection | `false` |  |
| dPopupClassName | Add `className` to the popup | - |  |
| dInputRender | custom input element | - |  |
| onModelChange | Callback for selected date changes | - |  |
| onVisibleChange | explicit/implicit callback | - |  |
| afterVisibleChange | Completion of explicit/implicit callbacks | - |  |
| onClear | Callback to clear the selected date | - |  |
<!-- prettier-ignore-end -->
