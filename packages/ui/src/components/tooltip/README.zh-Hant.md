---
title: 文字提示
---

文字提示气泡框。

## 何时使用

代替系统默认的 `title` 提示。

## API

### DTooltipProps

继承 `Omit<DPopupProps, 'dTarget'>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dTitle | 提示文字 | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DPopupProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dVisible | 手动控制 popup 的显示 | boolean | - |
| dContainer |  popup 的挂载节点，`false` 代表挂载到目标节点的父节点 | string \| HTMLElement \| `(() => HTMLElement \| null)` \| null \| false | - |
| dPlacement |  popup 弹出方向 | 'top' \| 'top-left' \| 'top-right' \| 'right' \| 'right-top' \| 'right-bottom' \| 'bottom' \| 'bottom-left' \| 'bottom-right' \| 'left' \| 'left-top' \| 'left-bottom' | 'top' |
| dAutoPlace | 当 popup 被遮挡时，自动调整位置，如果未指定 `dContainer` 属性，那么默认比较 `window` 视图 | boolean | true |
| dTarget | 目标节点 | string \| HTMLElement \| `(() => HTMLElement \| null)` \| null | - |
| dTrigger | 触发行为 | 'hover' \| 'focus' \| 'click' \| null | 'hover' |
| dDistance | 弹出窗口距离目标节点的距离 | number | 10 |
| dArrow | 是否显示箭头 | boolean | true |
| dZIndex | 手动控制 `z-index` 的值 | number | - |
| dMouseEnterDelay | 鼠标移入后多少毫秒后显示 | number | 150 |
| dMouseLeaveDelay | 鼠标移出后多少毫秒后显示 | number | 150 |
| dCustomPopup | 自定义 popup | `(popupEl: HTMLElement, targetEl: HTMLElement) => { top: number; left: number; stateList: DTransitionStateList }` | - |
| onTrigger | 触发 popup 显示/隐藏的回调 | `(visible: boolean) => void` | - |
| afterVisibleChange |  popup 显示/隐藏动画结束的回调 | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DTransitionStateList

```tsx
interface DTransitionStateList {
  'enter-from'?: Partial<CSSStyleDeclaration>;
  'enter-active'?: Partial<CSSStyleDeclaration>;
  'enter-to'?: Partial<CSSStyleDeclaration>;
  'leave-from'?: Partial<CSSStyleDeclaration>;
  'leave-active'?: Partial<CSSStyleDeclaration>;
  'leave-to'?: Partial<CSSStyleDeclaration>;
}
```
