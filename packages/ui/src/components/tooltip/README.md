---
group: Data Display
title: Tooltip
---

A text popup tip.

## When To Use

Replace the system default `title` prompt.

## API

### DTooltipProps

Extend `Omit<DPopupProps, 'dTarget'>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dTitle | Prompt text | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DPopupProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dVisible | Manually control the display of popup | boolean | - |
| dContainer | Mount node of popup, `false` represents the parent node mounted to the target node | string \| HTMLElement \| `(() => HTMLElement \| null)` \| null \| false | - |
| dPlacement | popup direction | 'top' \| 'top-left' \| 'top-right' \| 'right' \| 'right-top' \| 'right-bottom' \| 'bottom' \| 'bottom-left' \| 'bottom-right' \| 'left' \| 'left-top' \| 'left-bottom' | 'top' |
| dAutoPlace | When the popup is occluded, the position is automatically adjusted. If the `dContainer` attribute is not specified, the `window` view will be compared by default | boolean | true |
| dTarget | Target node | string \| HTMLElement \| `(() => HTMLElement \| null)` \| null | - |
| dTrigger | Trigger behavior | 'hover' \| 'focus' \| 'click' \| null | 'hover' |
| dDistance | The distance of the pop-up window from the target node | number | 10 |
| dArrow | Whether to show arrow | boolean | true |
| dZIndex | Manually control the value of `z-index` | number | - |
| dMouseEnterDelay | How many milliseconds after the mouse is moved to display | number | 150 |
| dMouseLeaveDelay | How many milliseconds after the mouse is moved out will it be displayed | number | 150 |
| dCustomPopup | Custom popup | `(popupEl: HTMLElement, targetEl: HTMLElement) => { top: number; left: number; stateList: DTransitionStateList }` | - |
| onTrigger | Trigger popup display/hide callback | `(visible: boolean) => void` | - |
| afterVisibleChange | Callback for the end of the popup show/hide animation | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DTransitionStateList

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
