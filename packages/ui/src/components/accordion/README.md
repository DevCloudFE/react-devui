---
group: Data Display
title: Accordion
aria: accordion
---

## API

### DAccordionProps

```tsx
interface DAccordionItem<ID extends DId> {
  id: ID;
  title: React.ReactNode;
  region: React.ReactNode;
  arrow?: boolean | 'left';
  disabled?: boolean;
}

interface DAccordionProps<ID extends DId, T extends DAccordionItem<ID>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dActive?: ID | null | ID[];
  dActiveOne?: boolean;
  dArrow?: 'left' | 'right' | false;
  onActiveChange?: (id: any, item: any) => void;
  afterActiveChange?: (id: any, item: any, active: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | List of data | - |  |
| dActive | Expanded item, controlled, defaults to `dActiveOne? null : []` | - |  |
| dActiveOne | Expand at most one item | `false` |  |
| dArrow | Expand icon position | `'right'` |  |
| onActiveChange | Callback for expanding/collapsing items | - |  |
| afterActiveChange | Callback when expand/collapse is complete | - |  |
<!-- prettier-ignore-end -->
