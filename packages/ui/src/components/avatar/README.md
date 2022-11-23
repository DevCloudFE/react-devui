---
group: Data Display
title: Avatar
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dVariant | Set avatar variations | `'circular'` |  |
| dImg | Set avatar picture | - |  |
| dIcon | Set avatar icon | - |  |
| dText | Set avatar text | - |  |
| dSize | Set avatar size | `40` |  |
<!-- prettier-ignore-end -->
