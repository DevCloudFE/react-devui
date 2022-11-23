---
title: 虚拟滚动
---

## API

### DVirtualScrollProps

```tsx
interface DItemRenderProps {
  aria: {
    'aria-level': number;
    'aria-setsize': number;
    'aria-posinset': number;
  };
  vsList?: React.ReactNode;
}

interface DVirtualScrollProps<T> {
  children: (props: { render: DCloneHTMLElement; vsList: React.ReactNode }) => JSX.Element | null;
  dRef?: { list?: React.ForwardedRef<any> };
  dList: T[];
  dFillNode: React.ReactElement;
  dItemRender: (item: T, index: number, props: DItemRenderProps, parent: T[]) => React.ReactNode;
  dItemSize: number | ((item: T) => number);
  dItemNested?: (item: T) => { list?: T[]; emptySize?: number; inAriaSetsize: boolean } | undefined;
  dItemKey: (item: T) => DId;
  dFocusable?: boolean | ((item: T) => boolean);
  dFocusItem?: T;
  dSize?: number;
  dPadding?: number;
  dHorizontal?: boolean;
  dEmptyRender?: (item: T) => React.ReactNode;
  dExpands?: Set<DId>;
  onScrollEnd?: () => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dRef | 传递 ref，`list` 为列表元素 | - |  |
| dList | 数据列表 | - |  |
| dFillNode | 填充未渲染项的节点 | - |  |
| dItemRender | 设置项目的渲染函数 | - |  |
| dItemSize | 设置项目的高度或宽度 | - |  |
| dItemNested | 判定项目是否嵌套列表 | - |  |
| dItemKey | 获取项目的唯一 `key` 值 | - |  |
| dFocusable | 判定项目是否可聚焦 | `true` |  |
| dFocusItem | 当前聚焦的项目 | - |  |
| dSize | 列表的高度或宽度 | - |  |
| dPadding | 列表的 `padding` 值 | - |  |
| dHorizontal | 是否水平滚动 | `false` |  |
| dEmptyRender | 如何渲染空列表（包括嵌套列表） | - |  |
| dExpands | 存在折叠动画时，提供折叠项 | - |  |
| onScrollEnd | 滚动到底部的回调 | - |  |
<!-- prettier-ignore-end -->
