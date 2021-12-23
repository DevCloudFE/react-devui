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
| dWidth | Inform the width of the list, it will be calculated automatically by default | number | - |
| dHeight | Inform the height of the list, it will be calculated automatically by default | number | - |
| dItemWidth | Inform the width of the list item, it is automatically calculated by default | number | - |
| dItemHeight | Tell the height of the list item, it will be calculated automatically by default | number | - |
| dList | List data | any[] | - |
| dItemRender | List item rendering | `(item: any, index: number, props: DItemRenderProps)  => React.ReactNode` | - | 
| dCustomSize | Enable multi-size mixing | `(item: any, index: number) => number` | - |
| onScrollEnd | Callback function when scrolling to the bottom of the list | `() => void` | - |
<!-- prettier-ignore-end -->

### DListRenderProps

```tsx
interface DListRenderProps {
  [key: `data-${string}virtual-scroll`]: string;
  onScroll: React.UIEventHandler<HTMLElement>;
  children: React.ReactNode;
}
```

### DListRenderProps

```tsx
interface DItemRenderProps {
  [key: `data-${string}virtual-scroll-reference`]: string;
}
```
