---
title: 卡片
---

## API

### DCardProps

```tsx
interface DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  dBorder?: boolean;
  dShadow?: boolean | 'hover';
  dActions?: React.ReactNode[];
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dBorder | 是否显示边框 | `true` |  |
| dShadow | 是否显示阴影 | `'false'` |  |
| dActions | 设置按钮组 | - |  |
<!-- prettier-ignore-end -->

### DCardHeaderProps

```tsx
interface DCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dAction?: React.ReactNode;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dAction | 设置按钮 | - |  |
<!-- prettier-ignore-end -->

### DCardContentProps

```tsx
type DCardContentProps = React.HTMLAttributes<HTMLDivElement>;
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
<!-- prettier-ignore-end -->
