---
group: Feedback
title: Drawer
---

A panel which slides in from the edge of the screen.

## When To Use

Users do not need to switch pages to complete some operations.

## API

### DDrawerProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dVisible | Is the drawer visible | boolean | false |
| dContainer | The mounted node of the drawer, `false` means it is mounted on the current node | string \| HTMLElement \| `(() => HTMLElement \| null)` \| null \| false | - |
| dPlacement | Drawer pop-up direction | 'top' \| 'right' \| 'bottom' \| 'left'  | 'right' |
| dWidth | Drawer width | number \| string | 400 |
| dHeight | Drawer height | number \| string | 280 |
| dZIndex | Manually control the value of `z-index` | number | - |
| dMask | Whether to show the mask | boolean | true |
| dMaskClosable | Click on the mask to close the drawer | boolean | true |
| dHeader | Drawer header | React.ReactNode | - |
| dFooter | Drawer footer | React.ReactNode | - |
| dDestroy | Destroy the node after shutdown | boolean | false |
| dChildDrawer | Nested child drawer | React.ReactNode | - |
| onClose | Callback when the drawer is closed | `() => void` | - |
| afterVisibleChange | Callback for the end of the drawer opening/closing animation | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DDrawerHeaderProps

Equal `Omit<DHeaderProps, 'onClose'>`.

### DHeaderProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dCloseIcon | Set the icon of the close button, `null` means hide the button | React.ReactNode | - |
| dExtraIcons | Add some extra action buttons | React.ReactNode[] | - |
| onClose | Callback when the close button is clicked | `() => void` | - |
<!-- prettier-ignore-end -->

### DDrawerFooterProps

Extend `DFooterProps`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| onOkClick | The callback of clicking the OK button, the operation feedback depends on the return value, and asynchronous operation can be achieved through `Promise` | `() => void \| boolean \| Promise<void \| boolean>` | - |
| onCancelClick | The callback of clicking the cancel button, the operation feedback depends on the return value, and asynchronous operation can be achieved through `Promise` | `() => void \| boolean \| Promise<void \| boolean>` | - |
<!-- prettier-ignore-end -->

### DFooterProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dAlign | Set the horizontal position of the button | 'left' \| 'center' \| 'right' | 'right' |
| dButtons | Custom button, `'cancel'` stands for cancel button, `'ok'` stands for OK button | React.ReactNode[] | `['cancel', 'ok']` |
| dOkButtonProps | Provide additional `Props` for the OK button | [DButtonProps](/components/Button#DButtonProps) | - |
| dCancelButtonProps | Provide additional `Props` for the cancel button | [DButtonProps](/components/Button#DButtonProps) | - |
| onOkClick | The callback of clicking the OK button | `() => void` | - |
| onCancelClick | The callback of clicking the cancel button | `() => void` | - |
<!-- prettier-ignore-end -->
