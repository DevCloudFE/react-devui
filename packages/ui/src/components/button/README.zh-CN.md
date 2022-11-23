---
title: 按钮
---

## API

### DButtonProps

```tsx
interface DButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dType?: 'primary' | 'secondary' | 'outline' | 'dashed' | 'text' | 'link';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dLoading?: boolean;
  dBlock?: boolean;
  dVariant?: 'circle' | 'round';
  dSize?: DSize;
  dIcon?: React.ReactNode;
  dIconRight?: boolean;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dType | 设置按钮类型 | `'primary'` |  |
| dTheme | 设置按钮主题色 | `'primary'` |  |
| dLoading | 按钮表现为加载中 | `false` |  |
| dBlock | 设置按钮宽度为 100% | `false` |  |
| dVariant | 设置按钮变体 | - |  |
| dSize | 设置按钮大小 | - |  |
| dIcon | 设置按钮图标，默认居左 | - |  |
| dIconRight | 按钮图标是否居右 | `false` |  |
<!-- prettier-ignore-end -->
