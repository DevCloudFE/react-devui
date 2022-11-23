---
title: 悬浮按钮
---

## API

### DFabProps

```tsx
interface DFabProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement<DFabButtonProps>;
  dExpand?: boolean;
  dList?: { placement: 'top' | 'right' | 'bottom' | 'left'; actions: React.ReactElement<DFabButtonProps>[] }[];
  onExpandChange?: (expand: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dExpand | 是否弹出按钮，受控，默认为 `false` | - |  |
| dList | 设置按钮列表 | - |  |
| onExpandChange | 按钮弹出状态变化的回调 | - |  |
<!-- prettier-ignore-end -->

### DFabButtonProps

```tsx
interface DFabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dType?: 'primary' | 'secondary' | 'outline' | 'dashed' | 'text' | 'link';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dLoading?: boolean;
  dVariant?: 'circle' | 'round';
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dType | 设置按钮类型 | `primary` |  |
| dTheme | 设置按钮主题色 | `'primary'` |  |
| dLoading | 按钮表现为加载中 | `false` |  |
| dVariant | 设置按钮变体 | - |  |
<!-- prettier-ignore-end -->

### DFabBacktopProps

```tsx
interface DFabBacktopProps extends DFabButtonProps {
  dPage?: DRefExtra;
  dDistance?: number | string;
  dScrollBehavior?: 'instant' | 'smooth';
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dPage | 设置滚动页面，默认为全局配置提供的滚动容器 | - |  |
| dDistance | 设置滚动多少距离显示按钮 | `400` |  |
| dScrollBehavior | 设置滚动行为 | `'instant'` |  |
<!-- prettier-ignore-end -->
