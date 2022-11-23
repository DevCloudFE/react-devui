---
title: 锚点
---

## API

### DAnchorProps

```tsx
interface DAnchorItem {
  href: string;
  title?: React.ReactNode;
  target?: string;
  children?: DAnchorItem[];
}

interface DAnchorProps<T extends DAnchorItem> extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  dList: T[];
  dPage?: DRefExtra;
  dDistance?: number | string;
  dScrollBehavior?: 'instant' | 'smooth';
  dIndicator?: React.ReactNode | typeof DOT_INDICATOR | typeof LINE_INDICATOR;
  onItemClick?: (href: string, item: T) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dPage | 设置页面元素，默认为全局配置提供的滚动容器 | - |  |
| dDistance | 判定锚点进入页面的距离值 | `0` |  |
| dScrollBehavior | 设置滚动行为 | `'instant'` |  |
| dIndicator | 设置指示器 | `DOT_INDICATOR` |  |
| onItemClick | 点击项目的回调 | - |  |
<!-- prettier-ignore-end -->
