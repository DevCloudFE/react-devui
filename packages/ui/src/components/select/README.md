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
| dSelect | Manual control options | [T \| null, Updater\<T \| null\>?] | - |
| dMultiple | Whether to select multiple | false | false |
| dCustomSelected | Customize selected options | `(select: DSelectBaseOption<T>) => string`  | - |
| onSelectChange | Selected change callback | `(select: T \| null) => void` | - |
<!-- prettier-ignore-end -->

### DSelectMultipleProps\<T\>

Extend `DSelectBaseProps<T>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dSelect | Manual control options | [T[], Updater\<T[]\>?] | - |
| dMultiple | Whether to select multiple | true | false |
| dMaxSelectNum | Maximum number of choices | number | - |
| dCustomSelected | Customize selected options | `(selects: Array<DSelectBaseOption<T>>) => string[]`  | - |
| onSelectChange | Selected change callback | `(selects: T[]) => void` | - |
| onExceed | Callbacks when the number of selections exceeds the limit | `() => void` | - |
<!-- prettier-ignore-end -->

### DSelectBaseProps\<T\>

Extend `Omit<DSelectBoxProps, 'dExpanded' | 'dShowClear'>, DFormControl`, [DSelectBoxProps](/components/Interface#DSelectBoxProps), [DFormControl](/components/Form#DFormControl).

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dVisible | Whether to pop up a window | [boolean, Updater\<boolean\>?] | - |
| dOptions | Options | Array\<DSelectOption\<T\>\> | - |
| dOptionRender | Custom selection | `(option: DSelectBaseOption<T>, index: number) => React.ReactNode` | - |
| dGetId | Get unique ID | `(value: T) => string` | `(value: unknown) => String(value)` |
| dClearable | Can it be cleared | boolean | false |
| dCustomSearch | Custom search | `{ filter?: (value: string, option: DSelectBaseOption<T>) => boolean; sort?: (a: DSelectBaseOption<T>, b: DSelectBaseOption<T>) => number; }` | - |
| dPopupClassName | Add className to the popup | string | - |
| onVisibleChange | Window display/hide callback | `(visible: boolean) => void` | - |
| onScrollBottom | Callback when the window scrolls to the bottom | `() => void` | - |
| onCreateOption | Search for callbacks to create new options | `(value: string) => DSelectBaseOption<T> \| null` | - |
<!-- prettier-ignore-end -->
