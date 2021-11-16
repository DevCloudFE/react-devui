---
group: General
title: DragDrop
---

Virtual scrolling list.

## When To Use

When there are too many list entries, using virtual scrolling can greatly reduce the rendering burden.

## API

### DVirtualScrollProps\<T\>

You can pass all the `Props` supported by the corresponding element of `dTag`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dTag | As the first parameter of `React.createElement` | 'string' | 'div' |
| dWidth | List width, set this value to enable virtual scrolling in the horizontal direction | string \| number | - |
| dHeight | List height, set this value to enable virtual scrolling in the vertical direction | string \| number | - |
| dItemWidth | Manually set the width of list entries | number | - |
| dItemHeight | Manually set the height of list items | number | - |
| dList | List data | T[] | - |
| dRenderItem | List item rendering | `(item: T, index: number) => React.ReactNode` | - | 
| dCustomSize | Enable multi-size mixing | `(item: T, index: number) => number` | - |
| onScrollEnd | Callback function when scrolling to the bottom of the list | `() => void` | - |
<!-- prettier-ignore-end -->
