---
group: Feedback
title: Modal
aria: dialogmodal
---

## API

### DModalProps

```tsx
interface DModalProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dWidth?: number | string;
  dTop?: number | string;
  dZIndex?: number | string;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dEscClosable?: boolean;
  dSkipFirstTransition?: boolean;
  dDestroyAfterClose?: boolean;
  dType?: {
    type: 'success' | 'warning' | 'error' | 'info';
    title?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
  };
  dHeader?: React.ReactElement | string;
  dFooter?: React.ReactElement;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dVisible | Whether the dialog is visible, controlled, default `false` | - | |
| dWidth | set dialog width | `520` | |
| dTop | Set the height of the dialog box from the top of the window | `100` | |
| dZIndex | Set the `z-index` of the dialog | - | |
| dMask | Whether to display the mask layer | `true` | |
| dMaskClosable | Click on the mask to close the dialog | `true` | |
| dEscClosable | Whether the dialog can be closed by Esc | `true` | |
| dSkipFirstTransition | Whether to skip the first animation | `true` | |
| dDestroyAfterClose | Whether to destroy the node after closing the dialog | `true` | |
| dType | set dialog type | - | |
| dHeader | set header | - | |
| dFooter | set footer | - | |
| onClose | Callback for closing the dialog box | - | |
| afterVisibleChange | Finished visible/hidden callback | - | |
<!-- prettier-ignore-end -->

### DModalHeaderProps

```tsx
interface DModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
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
| onCloseClick | Callback for clicking the close button | - | |
<!-- prettier-ignore-end -->

### DModalFooterProps

```tsx
interface DModalFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
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
