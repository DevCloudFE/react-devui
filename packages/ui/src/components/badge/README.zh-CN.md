---
title: 徽标
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
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dValue | 数量值 | - |  |
| dTheme | 设置主题色 | `'danger'` |  |
| dColor | 自定义颜色 | - |  |
| dShowZero | 显示 `0` 值 | `false` |  |
| dMax | 设置最大值 | `Infinity` |  |
| dDot | 显示为圆点 | `false` |  |
| dOffset | 自定义位置偏移 | `[0, '100%']` |  |
| dAlone | 作为独立元素显示 | `false` |  |
<!-- prettier-ignore-end -->
