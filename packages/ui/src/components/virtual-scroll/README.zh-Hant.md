---
title: 虚拟滚动
---

虚拟滚动列表。

## 何时使用

当列表条目过多时，使用虚拟滚动可以极大减少渲染负担。

## API

### DVirtualScrollProps\<T\>

可以传递 `dTag` 对应元素支持的所有 `Props`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dTag | 作为 `React.createElement` 的第一个参数 | 'string' | 'div' |
| dWidth | 列表宽度，设定该值启用水平方向的虚拟滚动 | string \| number | - |
| dHeight | 列表高度，设定该值启用垂直方向的虚拟滚动 | string \| number | - |
| dItemWidth | 手动设定列表条目宽度 | number | - |
| dItemHeight | 手动设定列表条目高度 | number | - |
| dList | 列表数据 | T[] | - |
| dItemRender | 列表条目渲染 | `(item: T, index: number, props: DItemRenderProps)  => React.ReactNode` | - | 
| dCustomSize | 启用多尺寸混合 | `(item: T, index: number) => number` | - |
| onScrollEnd | 滚动到列表底部时的回调函数 | `() => void` | - |
<!-- prettier-ignore-end -->
