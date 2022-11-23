---
title: 走马灯
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
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dActive | 激活项目，受控，默认为 `nth(dList, 0)?.id` | - |  |
| dAutoplay | 设置自动播放，`0` 表示不自动播放 | `0` |  |
| dArrow | 设置显示切换箭头 | `'hover'` |  |
| dPagination | 设置分页 | `true` |  |
| dEffect | 设置动画效果 | `slide` |  |
| dVertical | 是否垂直布局 | `false` |  |
| onActiveChange | 激活项目改变的回调 | - |  |
<!-- prettier-ignore-end -->
