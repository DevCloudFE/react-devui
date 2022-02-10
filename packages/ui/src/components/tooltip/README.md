---
group: Data Display
title: Tooltip
---

## API

### DTooltipProps

Extend `Omit<DPopupProps, 'dVisible' | 'dPopupContent'>`.

Please refer to [DPopupProps](/components/Interface#DPopupProps).

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dVisible | Manually control the display of tooltip | [boolean, Updater\<boolean\>] | - |
| dTitle | Prompt text | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DTooltipRef

```tsx
type DTooltipRef = DPopupRef;
```
