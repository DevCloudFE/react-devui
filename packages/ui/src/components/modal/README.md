---
group: Feedback
title: Modal
---

A dialog at the top center of the screen.

## When To Use

Users do not need to switch pages to complete some operations.

## API

### DModalProps

<!-- prettier-ignore-start -->
| Property | Description | Type | Default |
| --- | --- | --- | --- |
| dVisible | Is the modal visible | [boolean, Updater\<boolean\>?] | - |
| dWidth | Width of the modal | string \| number | 520px |
| dZIndex | The `z-index` of the Modal | number | - |
| dMask | Whether show mask or not | number \| string | true |
| dMaskClosable | Manually control the value of `z-index` | number | - |
| style | Add custom style for the dialog | CSSProperties | - |
| dAfterClose | Function called after the modal is closed completely | `() => void` | - |

### DModalHeaderProps

Equal `Omit<DHeaderProps, 'onClose'>`.

### DHeaderProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->

| Property    | Description                                                  | Type              | Default |
| ----------- | ------------------------------------------------------------ | ----------------- | ------- |
| dCloseIcon  | Set the icon of the close button, `null` means hide the button | React.ReactNode   | -       |
| dExtraIcons | Add some extra action buttons                                | React.ReactNode[] | -       |
| onClose     | Callback when the close button is clicked                    | `() => void`      | -       |

<!-- prettier-ignore-end -->

### DModalFooterProps

Extend `DFooterProps`.

<!-- prettier-ignore-start -->

| Property      | Description                                                  | Type         | Default |
| ------------- | ------------------------------------------------------------ | ------------ | ------- |
| okText        | Custom your okbutton text                                    | string       | Ok      |
| cancelText    | Custom your cancel button text                               | string       | Cancel  |
| onOkClick     | Function that will be called when user click the Ok button   | `() => void` | -       |
| onCancelClick | Function that will be called when user click the Cancel button | `() => void` | -       |

### DFooterProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->

| Property           | Description                                                  | Type                                            | Default            |
| ------------------ | ------------------------------------------------------------ | ----------------------------------------------- | ------------------ |
| dAlign             | Set the horizontal position of the button                    | 'left' \| 'center' \| 'right'                   | 'right'            |
| dButtons           | Custom button, `'cancel'` stands for cancel button, `'ok'` stands for OK button | React.ReactNode[]                               | `['cancel', 'ok']` |
| dOkButtonProps     | Provide additional `Props` for the OK button                 | [DButtonProps](/components/Button#DButtonProps) | -                  |
| dCancelButtonProps | Provide additional `Props` for the cancel button             | [DButtonProps](/components/Button#DButtonProps) | -                  |
| onOkClick          | The callback of clicking the OK button                       | `() => void`                                    | -                  |
| onCancelClick      | The callback of clicking the cancel button                   | `() => void`                                    | -                  |

<!-- prettier-ignore-end -->

### DElementSelector

```tsx
export type DElementSelector = HTMLElement | null | string | (() => HTMLElement | null);
```

