---
title: 拖放
---

拖拽组件。

## 何时使用

需要动态调整组件位置。

## API

### DDragProps

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dId | 唯一标识 | string | - |
| dPlaceholder | 占位节点 | React.ReactNode | - |
| dZIndex | 手动设定 `zIndex` | number | 1000 |
| children | 拖拽节点 | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DDropProps

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dContainer | 放置节点的容器 | DElementSelector | - |
| dDirection | 容器放置节点的方向 | 'horizontal' \| 'vertical' | 'vertical' |
| dPlaceholder | 占位节点 | React.ReactNode | 1000 |
| children | 拖拽节点 | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DDropRef

```tsx
export type DDropRef = string[];
```

### DDragPlaceholderProps

等于 `React.HTMLAttributes<HTMLDivElement>`。
