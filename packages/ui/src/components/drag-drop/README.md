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
<!-- prettier-ignore-end -->

### DDropProps

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dContainer | The container where the node is placed | DElementSelector | - |
| dDirection | The direction of the container to place the node | 'horizontal' \| 'vertical' | 'vertical' |
| dPlaceholder | Placeholder node | React.ReactNode | 1000 |
| children | Drag nodes | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DDropRef

```tsx
export type DDropRef = string[];
```

### DDragPlaceholderProps

Equal `React.HTMLAttributes<HTMLDivElement>`.
