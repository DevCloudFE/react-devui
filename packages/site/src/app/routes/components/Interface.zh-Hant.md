# 接口

## DElementSelector

```tsx
export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);
```

## DPopupProps

继承 `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dVisible | 控制 popup 的显示 | boolean | - |
| dPopupContent | popup 的内容 | React.ReactNode | - |
| dTriggerRender | popup 的目标节点 | `(props: DTriggerRenderProps) => React.ReactNode` | - |
| dTriggerEl |  自定义 popup 的目标节点 | HTMLElement \| null | - |
| dContainer |  popup 的挂载节点，`false` 代表挂载到目标节点的父节点 | DElementSelector \| false | - |
| dPlacement |  popup 弹出方向 | 'top' \| 'top-left' \| 'top-right' \| 'right' \| 'right-top' \| 'right-bottom' \| 'bottom' \| 'bottom-left' \| 'bottom-right' \| 'left' \| 'left-top' \| 'left-bottom' | 'top' |
| dAutoPlace | 当 popup 被遮挡时，自动调整位置，如果未指定 `dContainer` 属性，那么默认比较 `window` 视图 | boolean | true |
| dTrigger | 触发行为 | 'hover' \| 'focus' \| 'click' \| null | 'hover' |
| dDistance | 弹出窗口距离目标节点的距离 | number | 10 |
| dArrow | 是否显示箭头 | boolean | true |
| dZIndex | 手动控制 `z-index` 的值 | number | - |
| dDestroy | 关闭后销毁节点 | boolean | false |
| dMouseEnterDelay | 鼠标移入后多少毫秒后显示 | number | 150 |
| dMouseLeaveDelay | 鼠标移出后多少毫秒后显示 | number | 150 |
| dEscClose | 按下Esc是否关闭 | boolean | true |
| dCustomPopup | 自定义 popup | `(popupEl: HTMLElement, targetEl: HTMLElement) => { top: number; left: number; stateList: DTransitionStateList; arrowPosition?: React.CSSProperties }` | - |
| onVisibleChange | popup 显示/隐藏的回调 | `(visible: boolean) => void` | - |
| afterVisibleChange |  popup 显示/隐藏动画结束的回调 | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

## DPopupRef

```tsx
export interface DPopupRef {
  el: HTMLDivElement | null;
  triggerEl: HTMLElement | null;
  updatePosition: () => void;
}
```

## DTriggerRenderProps

```tsx
export interface DTriggerRenderProps {
  [key: `data-${string}popup-trigger`]: string;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}
```

## DTransitionStateList

```tsx
export interface DTransitionStateList {
  'enter-from'?: Partial<CSSStyleDeclaration>;
  'enter-active'?: Partial<CSSStyleDeclaration>;
  'enter-to'?: Partial<CSSStyleDeclaration>;
  'leave-from'?: Partial<CSSStyleDeclaration>;
  'leave-active'?: Partial<CSSStyleDeclaration>;
  'leave-to'?: Partial<CSSStyleDeclaration>;
}
```

## DHeaderProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dCloseIcon | 设置关闭按钮的图标， `null` 表示隐藏按钮 | React.ReactNode | - |
| dExtraIcons | 添加一些额外的操作按钮 | React.ReactNode[] | - |
| onClose | 点击关闭按钮的回调 | `() => void` | - |
<!-- prettier-ignore-end -->

## DFooterProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dAlign | 设置按钮的水平位置 | 'left' \| 'center' \| 'right' | 'right' |
| dButtons | 自定义按钮，`'cancel'` 代表取消按钮，`'ok'` 代表确定按钮 | React.ReactNode[] | `['cancel', 'ok']` |
| dOkButtonProps | 为确定按钮提供额外的 `Props` | [DButtonProps](/components/Button#DButtonProps) | - |
| dCancelButtonProps | 为取消按钮提供额外的 `Props` | [DButtonProps](/components/Button#DButtonProps) | - |
| onOkClick | 点击确定按钮的回调 | `() => void` | - |
| onCancelClick | 点击取消按钮的回调 | `() => void` | - |
<!-- prettier-ignore-end -->

## DSelectBoxProps

继承 `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dSuffix | 选择框后缀 | React.ReactNode | - |
| dExpanded | 是否展开 | boolean | false |
| dShowClear | 是否显示清除按钮 | boolean | false |
| dSearchable | 是否可搜索 | boolean | false |
| dClearIcon | 自定义清除按钮 | React.ReactNode | - |
| dSize | 选择框尺寸 | 'smaller' \| 'larger' | - |
| dPlaceholder | 占位内容 | string | - |
| dDisabled | 是否禁用 | boolean | false |
| dLoading | 是否为加载状态 | boolean | false |
| onClear | 点击清除按钮的回调 | `() => void` | - |
| onSearch | 搜索的回调 | `(value: string) => void` | - |
<!-- prettier-ignore-end -->
