---
group: Data Entry
title: Cascader
---

Cascading selection boxes.

## When To Use

Category selection is required.

## API

### DSelectSingleProps\<T\>

Extend `DCascaderSingleProps<T>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control options | [T[] \| null, Updater\<T[] \| null\>?] | - |
| dMultiple | Whether to select multiple | false | false |
| dCustomSelected | Customize selected options | `(select: Array<DCascaderOption<T>>) => string`  | - |
| onModelChange | Selected change callback | `(select: T[] \| null) => void` | - |
<!-- prettier-ignore-end -->

### DCascaderMultipleProps\<T\>

Extend `DCascaderBaseProps<T>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control options | [T[][], Updater\<T[][]\>?] | - |
| dMultiple | Whether to select multiple | true | false |
| dMaxSelectNum | Maximum number of choices | number | - |
| dCustomSelected | Customize selected options | `(selects: Array<Array<DCascaderOption<T>>>) => string[]` | - |
| onModelChange | Selected change callback | `(selects: T[]) => void` | - |
| onExceed | Callbacks when the number of selections exceeds the limit | `(selects: T[][]) => void` | - |
<!-- prettier-ignore-end -->

### DCascaderBaseProps\<T\>

Extend `React.HTMLAttributes<HTMLDivElement>, PickSelectBoxProps`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dVisible | Whether to pop up a window | [boolean, Updater\<boolean\>?] | - |
| dOptions | Options | Array\<DCascaderOption\<T\>\> | - |
| dOptionRender | Custom options | `(option: DCascaderOption<T>) => React.ReactNode` | - |
| dGetId | Get unique id | `(value: T) => string` | `(value: unknown) => String(value)` |
| dClearable | Is it clearable | boolean | false |
| dOnlyLeafSelectable | Whether only leaf nodes are optional | boolean | true |
| dCustomSearch | Custom search | `{ filter?: (value: string, option: Array<DCascaderOption<T>>) => boolean; sort?: (a: Array<DCascaderOption<T>>, b: Array<DCascaderOption<T>>) => number; }` | - |
| dPopupClassName | Add className to popup | string | - |
| dAutoMaxWidth | Automatically adjust max width | boolean | true |
| onVisibleChange | Window show/hide callback | `(visible: boolean) => void` | - |
| onFocusChange | Callback for focus change | `(value: T[]) => void` | - |
<!-- prettier-ignore-end -->

### DCascaderOption\<T\>

```tsx
export interface DCascaderOption<T> extends TreeOption {
  dValue: T;
  dLoading?: boolean;
  dChildren?: Array<DCascaderOption<T>>;
}
```
