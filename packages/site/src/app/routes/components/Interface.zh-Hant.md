# 接口

## DElementSelector

```tsx
export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);
```

## DPopupProps

继承 `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dVisible | Control the display of popup | boolean | - |
| dPopupContent | The contents of the popup | React.ReactNode | - |
| dTriggerRender | The target node of the popup | `(props: DTriggerRenderProps) => React.ReactNode` | - |
| dTriggerEl |  Custom popup target node | HTMLElement \| null | - |
| dContainer | Mount node of popup, `false` represents the parent node mounted to the target node | [DElementSelector](/components/Interface#DElementSelector) \| false | - |
| dPlacement | popup direction | 'top' \| 'top-left' \| 'top-right' \| 'right' \| 'right-top' \| 'right-bottom' \| 'bottom' \| 'bottom-left' \| 'bottom-right' \| 'left' \| 'left-top' \| 'left-bottom' | 'top' |
| dAutoPlace | When the popup is occluded, the position is automatically adjusted. If the `dContainer` attribute is not specified, the `window` view will be compared by default | boolean | true |
| dTrigger | Trigger behavior | 'hover' \| 'focus' \| 'click' \| null | 'hover' |
| dDistance | The distance of the pop-up window from the target node | number | 10 |
| dArrow | Whether to show arrow | boolean | true |
| dZIndex | Manually control the value of `z-index` | number | - |
| dDestroy | Destroy the node after shutdown | boolean | false |
| dMouseEnterDelay | How many milliseconds after the mouse is moved to display | number | 150 |
| dMouseLeaveDelay | How many milliseconds after the mouse is moved out will it be displayed | number | 150 |
| dCustomPopup | Custom popup | `(popupEl: HTMLElement, targetEl: HTMLElement) => { top: number; left: number; stateList: DTransitionStateList; arrowPosition?: React.CSSProperties }` | - |
| onVisibleChange | popup display/hide callback | `(visible: boolean) => void` | - |
| afterVisibleChange | Callback for the end of the popup show/hide animation | `(visible: boolean) => void` | - |
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