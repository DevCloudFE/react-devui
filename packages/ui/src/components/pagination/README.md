---
group: Navigation
title: Pagination
---

## API

### DPaginationProps

```tsx
interface DPaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dActive?: number;
  dTotal: number;
  dPageSize?: number;
  dPageSizeList?: number[];
  dCompose?: ('total' | 'pages' | 'page-size' | 'jump')[];
  dCustomRender?: {
    total?: (range: [number, number]) => React.ReactNode;
    prev?: React.ReactNode;
    page?: (page: number) => React.ReactNode;
    next?: React.ReactNode;
    pageSize?: (pageSize: number) => React.ReactNode;
    jump?: (input: React.ReactNode) => React.ReactNode;
  };
  dMini?: boolean;
  onPaginationChange?: (page: number, pageSize: number) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dActive | The current number of pages, controlled, default `1` | - |  |
| dTotal | Set the total | - |  |
| dPageSize | Set the number per page | - |  |
| dPageSizeList | Set selectable number per page | `[10, 20, 50, 100]` |  |
| dCompose | How to combine display pagination | `['pages']` |  |
| dCustomRender | Custom rendering | - |  |
| dMini | mini display | `false` |  |
| onPaginationChange | Callback for page or number per page changes | - |  |
<!-- prettier-ignore-end -->
