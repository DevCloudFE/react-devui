---
title: 锚点
---

跳转到页面指定位置。

## 何时使用

需要展现当前页面上可供跳转的锚点链接，以及快速在锚点之间跳转。

## API

### DAnchorProps

继承 `React.HTMLAttributes<HTMLUListElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dDistance | 页面到锚点的距离 | number | 0 |
| dPage | 设置滚动的页面，默认为 `window` 视图 | DElementSelector | - |
| dScrollBehavior | 自定义滚动行为 | 'instant' \| 'smooth' | 'instant' |
| dIndicator | 自定义指示器，预定义了 `'dot'` 以及 `'line'` 形态的指示器 | React.ReactNode | 'dot' |
| onHrefChange | 锚点改变的回调 | `(href: string \| null) => void` | - |
<!-- prettier-ignore-end -->

### DAnchorLinkProps

继承 `React.LiHTMLAttributes<HTMLLIElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dLevel | 设置锚点的层级 | number | 0 |
| href | 设置锚点链接 | string | - |
<!-- prettier-ignore-end -->

### DElementSelector

```tsx
export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);
```
