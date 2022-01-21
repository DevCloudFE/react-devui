---
title: 级联选择框
---

级联选择框。

## 何时使用

需要分类选择。

## API

### DCascaderSingleProps\<T\>

继承 `DCascaderBaseProps<T>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制选择项 | [T[] \| null, Updater\<T[] \| null\>?] | - |
| dMultiple | 是否多选 | false | false |
| dCustomSelected | 自定义已选项 | `(select: Array<DCascaderOption<T>>) => string`  | - |
| onModelChange | 选中改变的回调 | `(select: T[] \| null) => void` | - |
<!-- prettier-ignore-end -->

### DCascaderMultipleProps\<T\>

继承 `DCascaderBaseProps<T>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 手动控制选择项 | [T[][], Updater\<T[][]\>?] | - |
| dMultiple | 是否多选 | true | false |
| dCustomSelected | 自定义已选项 | `(selects: Array<Array<DCascaderOption<T>>>) => string[]` | - |
| onModelChange | 选中改变的回调 | `(selects: T[][]) => void` | - |
<!-- prettier-ignore-end -->

### DCascaderBaseProps\<T\>

继承 `React.HTMLAttributes<HTMLDivElement>, PickSelectBoxProps`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dVisible | 是否弹出窗口 | [boolean, Updater\<boolean\>?] | - |
| dOptions | 选择项 | Array\<DCascaderOption\<T\>\> | - |
| dOptionRender | 自定义选择项 | `(option: DCascaderOption<T>) => React.ReactNode` | - |
| dGetId | 获取唯一标识 | `(value: T) => string` | `(value: unknown) => String(value)` |
| dClearable | 是否可清除 | boolean | false |
| dOnlyLeafSelectable | 是否仅叶子节点可选 | boolean | true |
| dCustomSearch | 自定义搜索 | `{ filter?: (value: string, option: Array<DCascaderOption<T>>) => boolean; sort?: (a: Array<DCascaderOption<T>>, b: Array<DCascaderOption<T>>) => number; }` | - |
| dPopupClassName | 向弹窗添加 className | string | - |
| dAutoMaxWidth | 自动调整最大宽度 | boolean | true |
| onVisibleChange | 窗口显示/隐藏的回调 | `(visible: boolean) => void` | - |
| onFocusChange | 焦点改变的回调 | `(value: T[]) => void` | - |
<!-- prettier-ignore-end -->

### DCascaderOption\<T\>

```tsx
export interface DCascaderOption<T> extends TreeOption {
  dValue: T;
  dLoading?: boolean;
  dChildren?: Array<DCascaderOption<T>>;
}
```
