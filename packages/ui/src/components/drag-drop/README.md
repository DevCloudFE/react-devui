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

### DDropProps\<T\>

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dList | list data | [T[], Updater\<T[]\>?] | - |
| dItemRender | data rendering | `(item: T, index: number) => React.ReactNode` | - |
| dGetId | get unique id | `(item: T) => string` | - |
| dContainer | The container where the node is placed | [DElementSelector](/components/Interface#DElementSelector) | - |
| dDirection | The direction of the container to place the node | 'horizontal' \| 'vertical' | 'vertical' |
| dPlaceholder | Placeholder node | React.ReactNode | 1000 |
| onListChange | Callback for list order change | `(list: T[]) => void` | - |
| onDragStart | Callback for the start of the drag | `(id: string) => void` | - |
| onDragEnd | Callback for the end of the drag | `(id: string) => void` | - |
<!-- prettier-ignore-end -->

### DDragPlaceholderProps

Equal `React.HTMLAttributes<HTMLDivElement>`.
