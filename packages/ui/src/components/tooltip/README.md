---
group: Data Display
title: Tooltip
---

A text popup tip.

## When To Use

Replace the system default `title` prompt.

## API

### DTooltipProps

Extend `Omit<DPopupProps, 'dTriggerNode'>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dTitle | Prompt text | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DTooltipRef

```tsx
export type DTooltipRef = DPopupRef;
```

### DPopupProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dVisible | Manually control the display of popup | boolean | - |
| dPopupContent | The contents of the popup | React.ReactNode | - |
| dTriggerRender | The target node of the popup | `(props: DTriggerRenderProps) => React.ReactNode` | - |
| dTriggerEl |  Custom popup target node | HTMLElement \| null | - |
| dContainer | Mount node of popup, `false` represents the parent node mounted to the target node | DElementSelector \| false | - |
| dPlacement | popup direction | 'top' \| 'top-left' \| 'top-right' \| 'right' \| 'right-top' \| 'right-bottom' \| 'bottom' \| 'bottom-left' \| 'bottom-right' \| 'left' \| 'left-top' \| 'left-bottom' | 'top' |
| dAutoPlace | When the popup is occluded, the position is automatically adjusted. If the `dContainer` attribute is not specified, the `window` view will be compared by default | boolean | true |
| dTrigger | Trigger behavior | 'hover' \| 'focus' \| 'click' \| null | 'hover' |
| dDistance | The distance of the pop-up window from the target node | number | 10 |
| dArrow | Whether to show arrow | boolean | true |
| dZIndex | Manually control the value of `z-index` | number | - |
| dDestroy | Destroy the node after shutdown | boolean | false |
| dMouseEnterDelay | How many milliseconds after the mouse is moved to display | number | 150 |
| dMouseLeaveDelay | How many milliseconds after the mouse is moved out will it be displayed | number | 150 |
| dCustomPopup | Custom popup | `(popupEl: HTMLElement, targetEl: HTMLElement) => { top: number; left: number; stateList: DTransitionStateList }` | - |
| onTrigger | Trigger popup display/hide callback | `(visible: boolean) => void` | - |
| afterVisibleChange | Callback for the end of the popup show/hide animation | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DPopupRef

```tsx
export interface DPopupRef {
  el: HTMLDivElement | null;
  triggerEl: HTMLElement | null;
  updatePosition: () => void;
}
```

### DTriggerRenderProps

```tsx
export interface DTriggerRenderProps {
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}
```

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

### DElementSelector

```tsx
export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);
```
