---
group: Data Entry
title: Select
---

A control that provides options.

## When To Use

Replace the native selector.

## API

### DSelectSingleProps\<T\>

Extend `DSelectBaseProps<T>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control options | [T \| null, Updater\<T \| null\>?] | - |
| dMultiple | Whether to select multiple | false | false |
| dCustomSelected | Customize selected options | `(select: DSelectBaseOption<T>) => string`  | - |
| onModelChange | Selected change callback | `(select: T \| null) => void` | - |
<!-- prettier-ignore-end -->

### DSelectMultipleProps\<T\>

Extend `DSelectBaseProps<T>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control options | [T[], Updater\<T[]\>?] | - |
| dMultiple | Whether to select multiple | true | false |
| dMaxSelectNum | Maximum number of choices | number | - |
| dCustomSelected | Customize selected options | `(selects: Array<DSelectBaseOption<T>>) => string[]`  | - |
| onModelChange | Selected change callback | `(selects: T[]) => void` | - |
| onExceed | Callbacks when the number of selections exceeds the limit | `() => void` | - |
<!-- prettier-ignore-end -->

### DSelectBaseProps\<T\>

Extend `Omit<DSelectBoxProps, 'dExpanded' | 'dShowClear'>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dVisible | Whether to pop up a window | [boolean, Updater\<boolean\>?] | - |
| dOptions | Options | Array\<DSelectOption\<T\>\> | - |
| dOptionRender | Custom selection | `(option: DSelectBaseOption<T>) => React.ReactNode` | - |
| dGetId | Get unique ID | `(value: T) => string` | `(value: unknown) => String(value)` |
| dCreateOption | Allow creation of options | `(value: string) => DSelectBaseOption<T> \| null` | - |
| dClearable | Can it be cleared | boolean | false |
| dCustomSearch | Custom search | `{ filter?: (value: string, option: DSelectBaseOption<T>) => boolean; sort?: (a: DSelectBaseOption<T>, b: DSelectBaseOption<T>) => number; }` | - |
| dPopupClassName | Add className to the popup | string | - |
| onVisibleChange | Window display/hide callback | `(visible: boolean) => void` | - |
| onScrollBottom | Callback when the window scrolls to the bottom | `() => void` | - |
| onCreateOption | Search for callbacks to create new options | `(option: DSelectBaseOption<T>) => void` | - |
<!-- prettier-ignore-end -->

### DSelectBaseOption\<T\>

```tsx
interface DSelectBaseOption<T> {
  dLabel: string;
  dValue: T;
  dDisabled?: boolean;
  [index: string | symbol]: unknown;
}
```

### DSelectOption\<T\>

```tsx
interface DSelectOption<T> {
  dLabel: string;
  dValue?: T;
  dDisabled?: boolean;
  dChildren?: DSelectBaseOption<T>[];
  [index: string | symbol]: unknown;
}
```
