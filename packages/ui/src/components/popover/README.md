---
group: General
title: Popover
---

## API

### DPopoverProps

```tsx
interface DPopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dVisible?: boolean;
  dTrigger?: 'hover' | 'click';
  dContainer?: DRefExtra | false;
  dPlacement?: DPopupPlacement;
  dEscClosable?: boolean;
  dDestroyAfterClose?: boolean;
  dArrow?: boolean;
  dModal?: boolean;
  dDistance?: number;
  dInWindow?: number | false;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dZIndex?: number | string;
  dHeader?: React.ReactElement | string;
  dContent: React.ReactNode;
  dFooter?: React.ReactElement;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dVisible | Whether the popup is visible, controlled, default `false` | - |  |
| dTrigger | Set trigger behavior | `'hover'` |  |
| dContainer | Set the parent container, `false` means `parentElement` of the element | - |  |
| dPlacement | Set popup position | `'top'` |  |
| dEscClosable | Whether the popup can be closed by Esc | `true` |  |
| dDestroyAfterClose | Whether to destroy the node after closing the popup | `false` |  |
| dArrow | Whether to show arrows | `true` |  |
| dModal | Whether the popup is modal | `false` |  |
| dDistance | The distance between the popup and the trigger element | `10` |  |
| dInWindow | The minimum distance between the window border and the popup, `false` means that the popup is not forced to be in the window | `false` |  |
| dMouseEnterDelay | How many milliseconds to delay displaying the popup after the mouse is moved in | `150` |  |
| dMouseLeaveDelay | How many milliseconds to delay closing the popup after the mouse is moved out | `200` |  |
| dZIndex | Set the `z-index` of the popup | - |  |
| dHeader | Set header | - |  |
| dContent | Set content | - |  |
| dFooter | Set footer | - |  |
| onVisibleChange | Callback for visible change | - |  |
| afterVisibleChange | Callback for complete visible change | - |  |
<!-- prettier-ignore-end -->

### DPopoverHeaderProps

```tsx
interface DPopoverHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dActions?: React.ReactNode[];
  dCloseProps?: DButtonProps;
  onCloseClick?: () => void | false | Promise<void | false>;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dActions | Action button, `'close'` means close button | `[]` |  |
| dCloseProps | Set the props of the close button | - |  |
| onCloseClick | Callback for clicking the close button | - |  |
<!-- prettier-ignore-end -->

### DPopoverFooterProps

```tsx
interface DPopoverFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
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
| dAlign | Set button position | `'right'` |  |
| dActions | Action button, `'cancel'` means cancel button, `'ok'` means confirm button | `['cancel', 'ok']` |  |
| dCancelProps | Set the props of the cancel button | - |  |
| dOkProps | Set the props of the confirm button | - |  |
| onCancelClick | Callback for clicking the cancel button, terminate closing the window when returning `false`, support `Promise` | - |  |
| onOkClick | Callback for clicking the confirm button, terminate closing the window when returning `false`, support `Promise` | - |  |
<!-- prettier-ignore-end -->
