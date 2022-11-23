---
group: General
title: VirtualScroll
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dRef | Pass ref, `list` is the list element | - |  |
| dList | List of data | - |  |
| dFillNode | A node that populates unrendered items | - |  |
| dItemRender | Set the item's render function | - |  |
| dItemSize | Set the item's height or width | - |  |
| dItemNested | Determine if an item is a nested list | - |  |
| dItemKey | Get the item's unique `key` value | - |  |
| dFocusable | Determine if an item is focusable | `true` |  |
| dFocusItem | Currently focused project | - |  |
| dSize | The height or width of the list | - |  |
| dPadding | The `padding` value for the list | - |  |
| dHorizontal | Whether to scroll horizontally | `false` |  |
| dEmptyRender | How to render empty lists (including nested lists) | - |  |
| dExpands | When there is a collapse animation, provide a collapsed item | - |  |
| onScrollEnd | Callback for scroll to bottom | - |  |
<!-- prettier-ignore-end -->
