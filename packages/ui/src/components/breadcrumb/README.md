---
group: Navigation
title: Breadcrumb
aria: breadcrumb
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | List of data | - |  |
| dSeparator | Set separator | - |  |
| onItemClick | Callback for item click | - |  |
<!-- prettier-ignore-end -->
