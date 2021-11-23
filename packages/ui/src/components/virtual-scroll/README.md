---
group: General
title: VirtualScroll
---

Virtual scrolling list.

## When To Use

When there are too many list entries, using virtual scrolling can greatly reduce the rendering burden.

## API

### DVirtualScrollProps\<T\>

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dListRender | List rendering | `(props: DListRenderProps) => React.ReactNode` | - |
| dWidth | List width, set this value to enable virtual scrolling in the horizontal direction | string \| number | - |
| dHeight | List height, set this value to enable virtual scrolling in the vertical direction | string \| number | - |
| dItemWidth | Manually set the width of list entries | number | - |
| dItemHeight | Manually set the height of list items | number | - |
| dList | List data | T[] | - |
| dItemRender | List item rendering | `(item: T, index: number, props: DItemRenderProps)  => React.ReactNode` | - | 
| dCustomSize | Enable multi-size mixing | `(item: T, index: number) => number` | - |
| onScrollEnd | Callback function when scrolling to the bottom of the list | `() => void` | - |
<!-- prettier-ignore-end -->

### DListRenderProps

```tsx
export interface DListRenderProps {
  style: React.CSSProperties;
  'data-virtual-scroll': string;
  onScroll: React.UIEventHandler<HTMLElement>;
  children: React.ReactNode;
}
```

### DListRenderProps

```tsx
export interface DItemRenderProps {
  'data-virtual-scroll-reference'?: string;
}
```
