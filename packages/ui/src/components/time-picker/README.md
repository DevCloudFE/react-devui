---
group: Data Entry
title: TimePicker
compose: true
---

## API

```tsx
interface DTimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    inputLeft?: React.ForwardedRef<HTMLInputElement>;
    inputRight?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: Date | null | [Date, Date];
  dFormat?: string;
  dVisible?: boolean;
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dOrder?: 'ascend' | 'descend' | false;
  dPlaceholder?: string | [string?, string?];
  dRange?: boolean;
  dSize?: DSize;
  dClearable?: boolean;
  dDisabled?: boolean;
  dConfigTime?: (
    unit: 'hour' | 'minute' | 'second',
    value: number,
    position: 'start' | 'end',
    current: [Date | null, Date | null]
  ) => { disabled?: boolean; hidden?: boolean };
  d12Hour?: boolean;
  dPopupClassName?: string;
  dInputRender?: [
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?,
    DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>?
  ];
  onModelChange?: (date: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onClear?: () => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dRef | pass ref | - | |
| dFormControl | Support Forms | - | |
| dModel | selected time, controlled, default `null` | - | |
| dFormat | format time, refer to [dayjs](https://day.js.org/docs/en/display/format) | - | |
| dVisible | Visible, controlled, default `false` | - | |
| dPlacement | set popup position | `'bottom-left'` | |
| dOrder | Sort time, `false` means no sorting | `'ascend'` | |
| dPlaceholder | set the placeholder text of the selection box | - | |
| dRange | Whether range selection | `false` | |
| dSize | set the selection box size | - | |
| dClearable | Can be cleared | `false` | |
| dDisabled | Whether to disable | `false` | |
| dConfigTime | custom time options | - | |
| d12Hour | Whether to display as 12-hour format | `false` | |
| dPopupClassName | Add `className` to the popup | - | |
| dInputRender | custom input element | - | |
| onModelChange | callback for selected time change | - | |
| onVisibleChange | Visible/hidden callback | - | |
| afterVisibleChange | Finished visible/hidden callback | - | |
| onClear | Callback to clear the selected time | - | |
<!-- prettier-ignore-end -->
