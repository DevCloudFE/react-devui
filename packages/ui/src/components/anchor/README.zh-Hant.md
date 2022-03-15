---
title: 锚点
---

## API

### DAnchorProps

继承 `React.HTMLAttributes<HTMLUListElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dDistance | 页面到锚点的距离 | number | 0 |
| dPage | 设置滚动的页面，默认为 `window` 视图 | [DElementSelector](/components/Interface#DElementSelector) | - |
| dScrollBehavior | 自定义滚动行为 | 'instant' \| 'smooth' | 'instant' |
| dIndicator | 自定义指示器，预定义了 `DOT_INDICATOR` 以及 `LINE_INDICATOR` 形态的指示器 | React.ReactNode \| symbol | DOT_INDICATOR |
| onHrefChange | 锚点改变的回调 | `(href: string \| null) => void` | - |
<!-- prettier-ignore-end -->
