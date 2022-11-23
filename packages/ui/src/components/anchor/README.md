---
group: Navigation
title: Anchor
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | List of data | - |  |
| dPage | Set the page element, the default is the scroll container provided by the global configuration | - |  |
| dDistance | Determine the distance from the anchor point into the page | `0` |  |
| dScrollBehavior | Set scrolling behavior | `'instant'` |  |
| dIndicator | Set indicator | `DOT_INDICATOR` |  |
| onItemClick | Callback for item click | - |  |
<!-- prettier-ignore-end -->
