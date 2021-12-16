---
title: 虚拟滚动
---

虚拟滚动列表。

## 何时使用

当列表条目过多时，使用虚拟滚动可以极大减少渲染负担。

## API

### DVirtualScrollProps

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dListRender | 列表渲染 | `(props: DListRenderProps) => React.ReactNode` | - |
| dScrollY | 是否为Y轴滚动 | boolean | true |
| dWidth | 告知列表宽度，默认自动计算 | number | - |
| dHeight | 告知列表高度，默认自动计算 | number | - |
| dItemWidth | 告知列表条目宽度，默认自动计算 | number | - |
| dItemHeight | 告知列表条目高度，默认自动计算 | number | - |
| dList | 列表数据 | any[] | - |
| dItemRender | 列表条目渲染 | `(item: any, index: number, props: DItemRenderProps)  => React.ReactNode` | - | 
| dCustomSize | 启用多尺寸混合 | `(item: any, index: number) => number` | - |
| onScrollEnd | 滚动到列表底部时的回调函数 | `() => void` | - |
<!-- prettier-ignore-end -->

### DListRenderProps

```tsx
export interface DListRenderProps {
  [key: `data-${string}virtual-scroll`]: string;
  onScroll: React.UIEventHandler<HTMLElement>;
  children: React.ReactNode;
}
```

### DListRenderProps

```tsx
export interface DItemRenderProps {
  [key: `data-${string}virtual-scroll-reference`]: string;
}
```
