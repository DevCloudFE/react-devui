---
title: 图片
---

## API

### DImageProps

```tsx
interface DImageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dLoading?: React.ReactNode;
  dError?: React.ReactNode;
  dActions?: React.ReactElement[];
  dImgProps: React.ImgHTMLAttributes<HTMLImageElement>;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dLoading | 设置加载图片时的占位显示 | - |  |
| dError | 设置图片加载失败时的显示 | - |  |
| dActions | 设置按钮组 | - |  |
| dImgProps | 设置图片 props | - |  |
<!-- prettier-ignore-end -->

### DImagePreviewProps

```tsx
interface DImagePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  dList: React.ImgHTMLAttributes<HTMLImageElement>[];
  dActive?: number;
  dVisible?: boolean;
  dZIndex?: number | string;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dEscClosable?: boolean;
  onActiveChange?: (index: number) => void;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dActive | 激活图片，受控，默认为 `0` | - |  |
| dVisible | 是否显示，受控，默认为 `false` | - |  |
| dZIndex | 设置图片预览的 `z-index` | - |  |
| dMask | 是否显示遮罩层 | `true` |  |
| dMaskClosable | 点击遮罩层关闭图片预览 | `true` |  |
| dEscClosable | 是否可通过 Esc 关闭图片预览 | `true` |  |
| onActiveChange | 激活图片改变的回调 | - |  |
| onClose | 关闭图片预览的回调 | - |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->
