---
title: 手风琴
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
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dActive | 展开项目，受控，默认为 `dActiveOne ? null : []` | - |  |
| dActiveOne | 至多展开一项 | `false` |  |
| dArrow | 展开图标位置 | `'right'` |  |
| onActiveChange | 展开/折叠项目的回调 | - |  |
| afterActiveChange | 完成展开/折叠的回调 | - |  |
<!-- prettier-ignore-end -->
