---
group: Feedback
title: Drawer
aria: dialogmodal
---

## API

### DDrawerProps

```tsx
interface DDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dContainer?: DRefExtra | false;
  dPlacement?: 'top' | 'right' | 'bottom' | 'left';
  dWidth?: number | string;
  dHeight?: number | string;
  dZIndex?: number | string;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dEscClosable?: boolean;
  dSkipFirstTransition?: boolean;
  dDestroyAfterClose?: boolean;
  dHeader?: React.ReactElement | string;
  dFooter?: React.ReactElement;
  dChildDrawer?: React.ReactElement;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dVisible | whether the drawer is visible, controlled, default `false` | - | |
| dContainer | set the parent container, `false` means `parentElement` of the element | - | |
| dPlacement | set drawer position | `'right'` | |
| dWidth | set drawer width | `400` | |
| dHeight | set drawer height | `280` | |
| dZIndex | Set the `z-index` of the drawer | - | |
| dMask | Whether to display the mask layer | `true` | |
| dMaskClosable | Click the mask to close the drawer | `true` | |
| dEscClosable | Whether the drawer can be closed by Esc | `true` | |
| dSkipFirstTransition | Whether to skip the first animation | `true` | |
| dDestroyAfterClose | Whether to destroy the node after closing the drawer | `true` | |
| dHeader | set header | - | |
| dFooter | set footer | - | |
| dChildDrawer | set nested drawer | - | |
| onClose | Callback for closing the drawer | - | |
| afterVisibleChange | Finished visible/hidden callback | - | |
<!-- prettier-ignore-end -->

### DDrawerHeaderProps

```tsx
interface DDrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dActions?: React.ReactNode[];
  dCloseProps?: DButtonProps;
  onCloseClick?: () => void | false | Promise<void | false>;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dActions | action button, `'close'` means close button | `['close']` | |
| dCloseProps | set the props of the close button | - | |
| onCloseClick | Callback for clicking the close button | - |
<!-- prettier-ignore-end -->

### DDrawerFooterProps

```tsx
interface DDrawerFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dAlign?: 'left' | 'center' | 'right';
  dActions?: React.ReactNode[];
  dCancelProps?: DButtonProps;
  dOkProps?: DButtonProps;
  onCancelClick?: () => void | false | Promise<void | false>;
  onOkClick?: () => void | false | Promise<void | false>;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dAlign | set button position | `'right'` | |
| dActions | action button, `'cancel'` means cancel button, `'ok'` means confirm button | `['cancel', 'ok']` | |
| dCancelProps | set the props of cancel button | - | |
| dOkProps | Set the props of the confirm button | - | |
| onCancelClick | The callback of clicking the cancel button, when `false` is returned, the window will be terminated, `Promise` is supported | - | |
| onOkClick | Callback for clicking the confirm button, when returning `false`, stop closing the window, support `Promise` | - | |
<!-- prettier-ignore-end -->
