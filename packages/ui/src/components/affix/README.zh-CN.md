---
title: 固钉
---

## API

### DAffixProps

```tsx
interface DAffixProps {
  children: React.ReactElement;
  dTarget?: DRefExtra | false;
  dTop?: number | string;
  dZIndex?: number | string;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dTarget | 设置目标元素，`false` 表示元素的 `parentElement`，默认为全局配置提供的滚动容器 | - |  |
| dTop | 固钉距离目标元素的 `top` 值 | `0` |  |
| dZIndex | 设置固钉的 `z-index` | - |  |
<!-- prettier-ignore-end -->
