---
title: 面包屑
---

## API

### DBreadcrumbProps

```tsx
interface DBreadcrumbItem<ID extends DId> {
  id: ID;
  title: React.ReactNode;
  link?: boolean;
  separator?: React.ReactNode;
}

interface DBreadcrumbProps<ID extends DId, T extends DBreadcrumbItem<ID>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dList: T[];
  dSeparator?: React.ReactNode;
  onItemClick?: (id: T['id'], item: T) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dSeparator | 设置分隔符 | - |  |
| onItemClick | 点击项目的回调 | - |  |
<!-- prettier-ignore-end -->
