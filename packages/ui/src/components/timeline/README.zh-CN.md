---
title: 时间轴
---

## API

### DTimelineProps

```tsx
interface DTimelineItem {
  content: [React.ReactNode, React.ReactNode];
  icon?: React.ReactNode;
  status?: 'completed' | 'active' | 'wait' | 'error';
}

interface DTimelineProps<T extends DTimelineItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dVertical?: boolean;
  dLineSize?: number;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dVertical | 是否垂直布局 | `false` |  |
| dLineSize | 设置轴宽 | `36` |  |
<!-- prettier-ignore-end -->
