---
title: 分页
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
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dActive | 当前页数，受控，默认为 `1` | - |  |
| dTotal | 设置总数 | - |  |
| dPageSize | 设置每页数量 | - |  |
| dPageSizeList | 设置可选择的每页数量 | `[10, 20, 50, 100]` |  |
| dCompose | 如何组合显示分页 | `['pages']` |  |
| dCustomRender | 自定义渲染 | - |  |
| dMini | mini 显示 | `false` |  |
| onPaginationChange | 页数或每页数量改变的回调 | - |  |
<!-- prettier-ignore-end -->
