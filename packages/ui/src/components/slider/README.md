---
group: Data Entry
title: Slider
---

Slide the input bar.

## When To Use

Let the user specify a numeric value which must be no less than a given value, and no more than another given value.

## API

### DSliderSingleProps

Extend `DSliderBaseProps`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control value | [number, Updater\<number\>?] | - |
| dRange | Range selection | false | false |
| dInputProps | Attributes applied to `input` elements | React.InputHTMLAttributes\<HTMLInputElement\>  | - |
| dInputRef | Pass `ref` to `input` element | React.Ref\<HTMLInputElement\>  | - |
| dTooltipVisible | Whether the prompt is visible | boolean  | - |
| onModelChange | Value change callback | `(value: number) => void` | - |
<!-- prettier-ignore-end -->

### DSliderRangeProps

Extend `DSliderBaseProps`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control value | [[number, number], Updater\<[number, number]\>?] | - |
| dRange | Range selection | true | false |
| dRangeMinDistance | Range select minimum spacing | number | - |
| dRangeThumbDraggable | Whether the range selection track is draggable | boolean | false |
| dInputProps | Attributes applied to `input` elements | [React.InputHTMLAttributes\<HTMLInputElement\>?, React.InputHTMLAttributes\<HTMLInputElement\>?]  | - |
| dInputRef | Pass `ref` to `input` element | [React.Ref\<HTMLInputElement\>?, React.Ref\<HTMLInputElement\>?]  | - |
| dTooltipVisible | Whether the prompt is visible | [boolean?, boolean?]  | - |
| onModelChange | Value change callback | `(value: [number, number]) => void` | - |
<!-- prettier-ignore-end -->

### DSliderBaseProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dMax |  Maximum value | number | 100 |
| dMin | Minimum | number | 0 |
| dStep | Step size, null means only values in `dMarks` can be selected | number | null | 1 |
| dMarks | Tick marks | number | ({ value: number; label: React.ReactNode } | number)[] | - |
| dVertical | Whether to display vertically | boolean | false |
| dReverse | Whether to invert the display | boolean | false |
| dDisabled | Whether to disable | boolean | false |
| dCustomTooltip | Custom prompt | `(value: number) => React.ReactNode` | - |
<!-- prettier-ignore-end -->
