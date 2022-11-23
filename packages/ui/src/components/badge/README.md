---
group: Data Display
title: Badge
---

## API

### DBadgeProps

```tsx
interface DBadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dValue: number;
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dColor?: string;
  dShowZero?: boolean;
  dMax?: number;
  dDot?: boolean;
  dOffset?: [number | string, number | string];
  dAlone?: boolean;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dValue | Quantity value | - |  |
| dTheme | Set theme color | `'danger'` |  |
| dColor | Custom color | - |  |
| dShowZero | Show `0` value | `false` |  |
| dMax | Set maximum | `Infinity` |  |
| dDot | Show as dots | `false` |  |
| dOffset | Custom position offset | `[0, '100%']` |  |
| dAlone | displayed as individual elements | `false` |  |
<!-- prettier-ignore-end -->
