---
group: General
title: DragDrop
---

Drag and drop components.

## When To Use

Need to dynamically adjust the component position.

## API

### DDragProps

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dId | Uniquely identifies | string | - |
| dPlaceholder | Placeholder node | React.ReactNode | - |
| dZIndex | Manually set `zIndex` | number | 1000 |
| children | Drag node | React.ReactNode | - |
| onDragStart | Callback for the start of the drag | `() => void` | - |
| onDragEnd | Callback for the end of the drag | `() => void` | - |
<!-- prettier-ignore-end -->

### DDropProps

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dContainer | The container where the node is placed | [DElementSelector](/components/Interface#DElementSelector) | - |
| dDirection | The direction of the container to place the node | 'horizontal' \| 'vertical' | 'vertical' |
| dPlaceholder | Placeholder node | React.ReactNode | 1000 |
| children | Drag nodes | React.ReactNode | - |
| onOrderChange | Callback for changing the order of child nodes | `(order: string[]) => void` | - |
| onDragStart | Callback for the start of the drag | `(id: string) => void` | - |
| onDragEnd | Callback for the end of the drag | `(id: string) => void` | - |
<!-- prettier-ignore-end -->

### DDropRef

```tsx
export type DDropRef = string[];
```

### DDragPlaceholderProps

Equal `React.HTMLAttributes<HTMLDivElement>`.
