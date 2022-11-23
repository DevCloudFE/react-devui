---
group: Data Display
title: Image
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dLoading | Set placeholder display when loading pictures | - |  |
| dError | Set the display when the image fails to load | - |  |
| dActions | Set button group | - |  |
| dImgProps | Set image props | - |  |
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dList | List of data | - |  |
| dActive | Activation image, controlled, defaults to `0` | - |  |
| dVisible | Whether to display, controlled, default is `false` | - |  |
| dZIndex | Set `z-index` of image preview | - |  |
| dMask | Whether to display the mask layer | `true` |  |
| dMaskClosable | Click on the mask layer to close the image preview | `true` |  |
| dEscClosable | Is it possible to close the image preview by Esc | `true` |  |
| onActiveChange | Callback that activates image changes | - |  |
| onClose | Callback to close image preview | - |  |
| afterVisibleChange | Completion of explicit/implicit callbacks | - |  |
<!-- prettier-ignore-end -->
