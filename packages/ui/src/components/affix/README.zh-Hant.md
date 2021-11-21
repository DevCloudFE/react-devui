---
title: 固钉
---

将页面元素钉在可视范围。

## 何时使用

需要更灵活的 `sticky` 定位。

## API

### DAffixProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dTarget | 设置需要监听其滚动事件的元素，默认比较 `window` 视图 | string \| HTMLElement \| `(() => HTMLElement \| null)` \| null | - |
| dTop | 距离顶部达到指定偏移量后触发 | string \| number | 0 |
| dBottom | 距离底部达到指定偏移量后触发 | string \| number | 0 |
| dZIndex | 手动控制 `z-index` 的值 | number | 900 |
| onFixedChange | 固定状态改变时触发的回调函数 | `(fixed: boolean) => void` | - | 
<!-- prettier-ignore-end -->
