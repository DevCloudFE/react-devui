---
group: Layout
title: Affix
---

Pin the page elements to the visible range.

## When To Use

Need more flexible `sticky` positioning.

## API

### DAffixProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dTarget | Set the element that needs to listen to its scroll event, compare the `window` view by default | string \| HTMLElement \| `(() => HTMLElement \| null)` \| null | - |
| dTop | Trigger after reaching the specified offset from the top | string \| number | 0 |
| dBottom | Trigger after reaching the specified offset from the bottom | string \| number | 0 |
| dZIndex | Manually control the value of `z-index` | number | 900 |
| onFixedChange | The callback function triggered when the fixed state changes | `(fixed: boolean) => void` | - | 
<!-- prettier-ignore-end -->
