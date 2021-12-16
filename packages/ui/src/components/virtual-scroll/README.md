---
group: General
title: VirtualScroll
---

Virtual scrolling list.

## When To Use

When there are too many list entries, using virtual scrolling can greatly reduce the rendering burden.

## API

### DVirtualScrollProps

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dListRender | List rendering | `(props: DListRenderProps) => React.ReactNode` | - |
| dScrollY | Whether it is Y axis scrolling | boolean | true |
| dItemWidth | Manually set the width of list entries | number | - |
| dItemHeight | Manually set the height of list items | number | - |
| dList | List data | any[] | - |
| dItemRender | List item rendering | `(item: any, index: number, props: DItemRenderProps)  => React.ReactNode` | - | 
| dCustomSize | Enable multi-size mixing | `(item: any, index: number) => number` | - |
| onScrollEnd | Callback function when scrolling to the bottom of the list | `() => void` | - |
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
