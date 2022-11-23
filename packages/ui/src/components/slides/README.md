---
group: Data Display
title: Slides
aria: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
---

## API

### DSlidesProps

```tsx
interface DSlideItem<ID extends DId> {
  id: ID;
  tooltip?: string;
  content: React.ReactNode;
}

interface DAutoplayOptions {
  delay?: number;
  stopOnLast?: boolean;
  pauseOnMouseEnter?: boolean;
}

interface DPaginationOptions {
  visible?: boolean | 'hover';
  dynamic?: boolean;
}

interface DSlidesProps<ID extends DId, T extends DSlideItem<ID>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dActive?: ID;
  dAutoplay?: number | DAutoplayOptions;
  dArrow?: boolean | 'hover';
  dPagination?: boolean | 'hover' | DPaginationOptions;
  dEffect?: 'slide' | 'fade';
  dVertical?: boolean;
  onActiveChange?: (id: any, slide: any) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | List of data | - |  |
| dActive | Active item, controlled, defaults to `nth(dList, 0)?.id` | - |  |
| dAutoplay | Set autoplay, `0` means no autoplay | `0` |  |
| dArrow | Set show toggle arrow | `'hover'` |  |
| dPagination | Set pagination | `true` |  |
| dEffect | Animate  | `slide` |  |
| dVertical | Whether vertical layout | `false` |  |
| onActiveChange | Callback to activate item changes | - |  |
<!-- prettier-ignore-end -->
