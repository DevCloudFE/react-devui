---
title: 头像
---

## API

### DAvatarProps

```tsx
interface DAvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dVariant?: 'circular' | 'square';
  dImg?: React.ImgHTMLAttributes<HTMLImageElement>;
  dIcon?: React.ReactNode;
  dText?: React.ReactNode;
  dSize?: number;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dVariant | 设置头像变体 | `'circular'` |  |
| dImg | 设置头像图片 | - |  |
| dIcon | 设置头像图标 | - |  |
| dText | 设置头像文字 | - |  |
| dSize | 设置头像大小 | `40` |  |
<!-- prettier-ignore-end -->
