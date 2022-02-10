---
title: 文字提示
---

## API

### DTooltipProps

继承 `Omit<DPopupProps, 'dVisible' | 'dPopupContent'>`。

请参考 [DPopupProps](/components/Interface#DPopupProps)。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dVisible | 手动控制 tooltip 的显示 | [boolean, Updater\<boolean\>] | - |
| dTitle | 提示文字 | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DTooltipRef

```tsx
type DTooltipRef = DPopupRef;
```
