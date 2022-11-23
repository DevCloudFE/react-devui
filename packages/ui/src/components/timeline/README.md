---
group: Data Display
title: Timeline
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | List of data | - |  |
| dVertical | whether vertical layout | `false` |  |
| dLineSize | set axis width | `36` |  |
<!-- prettier-ignore-end -->
