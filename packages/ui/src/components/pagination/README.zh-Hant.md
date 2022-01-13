---
title: 分页
---

将一系列页面分割到不同页。

## 何时使用

常用于页面导航或者表格分页。

## API

### DPaginationProps

继承 `React.HTMLAttributes<HTMLElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dActive | 手动控制活动的页数 | [number, Updater\<number\>?] | 1 |
| dTotal | 条目总数 | number | - |
| dPageSize | 每页包含条目数 | [number, Updater\<number\>?] | - |
| dPageSizeOptions | 可供选择的每页条目数 | number[] | [10, 20, 50, 100] |
| dCompose | 自由组合配置 | `Array<'total' \| 'pages' \| 'size' \| 'jump'>` | ['pages'] |
| dCustomRender | 自定义配置 | `{ total?: (range: [number, number]) => React.ReactNode; prev?: React.ReactNode; page?: (page: number) => React.ReactNode; next?: React.ReactNode; sizeOption?: (size: number) => React.ReactNode; jump?: (input: React.ReactNode) => React.ReactNode; }` | - |
| dMini | 迷你形态 | boolean | false |
| onActiveChange | 活动页数改变的回调 | `(page: number) => void` | - |
| onPageSizeChange | 每页条目数改变的回调 | `(size: number) => void` | - |
<!-- prettier-ignore-end -->
