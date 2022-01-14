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
| dVisible | Is the drawer visible | [boolean, Updater\<boolean\>?] | - |
| dContainer | The mounted node of the drawer, `false` means it is mounted on the current node | [DElementSelector](/components/Interface#DElementSelector) \| false | - |
| dPlacement | Drawer pop-up direction | 'top' \| 'right' \| 'bottom' \| 'left'  | 'right' |
| dWidth | Drawer width | number \| string | 400 |
| dHeight | Drawer height | number \| string | 280 |
| dZIndex | Manually control the value of `z-index` | number \| string | - |
| dMask | Whether to show the mask | boolean | true |
| dMaskClosable | Click on the mask to close the drawer | boolean | true |
| dEscClosable | Whether to close by pressing Esc | boolean | true |
| dHeader | Drawer header | React.ReactNode | - |
| dFooter | Drawer footer | React.ReactNode | - |
| dDestroy | Destroy the node after shutdown | boolean | false |
| dChildDrawer | Nested child drawer | React.ReactNode | - |
| onClose | Callback when the drawer is closed | `() => void` | - |
| afterVisibleChange | Callback for the end of the drawer opening/closing animation | `(visible: boolean) => void` | - |
<!-- prettier-ignore-end -->

### DDrawerHeaderProps

Equal `Omit<DHeaderProps, 'onClose'>`.

Please refer to [DHeaderProps](/components/Interface#DHeaderProps).

### DDrawerFooterProps

Extend `DFooterProps`.

Please refer to [DFooterProps](/components/Interface#DFooterProps).

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| onOkClick | The callback of clicking the OK button, the operation feedback depends on the return value, and asynchronous operation can be achieved through `Promise` | `() => void \| boolean \| Promise<void \| boolean>` | - |
| onCancelClick | The callback of clicking the cancel button, the operation feedback depends on the return value, and asynchronous operation can be achieved through `Promise` | `() => void \| boolean \| Promise<void \| boolean>` | - |
<!-- prettier-ignore-end -->
