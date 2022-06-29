---
title: 日期选择框
---

## API

### DSelectSingleProps\<T\>

继承 `DSelectBaseProps<T>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制选择项 | [T \| null, Updater\<T \| null\>?] | - |
| dMultiple | 是否多选 | false | false |
| dCustomSelected | 自定义已选项 | `(select: DSelectBaseOption<T>) => string`  | - |
| onModelChange | 选中改变的回调 | `(select: T \| null) => void` | - |
<!-- prettier-ignore-end -->

### DSelectMultipleProps\<T\>

继承 `DSelectBaseProps<T>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制选择项 | [T[], Updater\<T[]\>?] | - |
| dMultiple | 是否多选 | true | false |
| dMaxSelectNum | 最大选择数 | number | - |
| dCustomSelected | 自定义已选项 | `(selects: Array<DSelectBaseOption<T>>) => string[]`  | - |
| onModelChange | 选中改变的回调 | `(selects: T[]) => void` | - |
| onExceed | 选择数超出限制的回调 | `() => void` | - |
<!-- prettier-ignore-end -->

### DSelectBaseProps\<T\>

继承 `Omit<DSelectBoxProps, 'dExpanded' | 'dShowClear'>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dVisible | 是否弹出窗口 | [boolean, Updater\<boolean\>?] | - |
| dOptions | 选择项 | Array\<DSelectOption\<T\>\> | - |
| dOptionRender | 自定义选择项 | `(option: DSelectBaseOption<T>) => React.ReactNode` | - |
| dGetId | 获取唯一标识 | `(value: T) => string` | `(value: unknown) => String(value)` |
| dCreateOption | 允许创建选项 | `(value: string) => DSelectBaseOption<T> \| null` | - |
| dClearable | 是否可清除 | boolean | false |
| dCustomSearch | 自定义搜索 | `{ filter?: (value: string, option: DSelectBaseOption<T>) => boolean; sort?: (a: DSelectBaseOption<T>, b: DSelectBaseOption<T>) => number; }` | - |
| dPopupClassName | 向弹窗添加 className | string | - |
| onVisibleChange | 窗口显示/隐藏的回调 | `(visible: boolean) => void` | - |
| onScrollBottom | 窗口滚动到底部的回调 | `() => void` | - |
| onCreateOption | 搜索创建新选项的回调 | `(option: DSelectBaseOption<T>) => void` | - |
<!-- prettier-ignore-end -->

### DSelectBaseOption\<T\>

```tsx
interface DSelectBaseOption<T> {
  dLabel: string;
  dValue: T;
  disabled?: boolean;
  [index: string | symbol]: unknown;
}
```

### DSelectOption\<T\>

```tsx
interface DSelectOption<T> {
  dLabel: string;
  dValue?: T;
  disabled?: boolean;
  dChildren?: DSelectBaseOption<T>[];
  [index: string | symbol]: unknown;
}
```
