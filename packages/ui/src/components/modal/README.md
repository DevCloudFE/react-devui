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
| visible | Is the modal visible | [boolean, Updater\<boolean\>?] | - |
| title | Title of the modal | string \| ReactNode | - |
| width | Width of the modal | string \| number | 520px |
| zIndex | The `z-index` of the Modal | number | - |
| mask | Whether show mask or not | number \| string | true |
| maskClosable | Manually control the value of `z-index` | number | - |
| style | Add custom style for the dialog | CSSProperties | - |
| okText | Custom your okbutton text | string | Ok |
| cancelText | Custom your cancel button text | string | Cancel |
| afterClose | Function called after the modal is closed completely | `() => void` | - |
| onOk | Function that will be called when user click the Okbutton | `() => void` | - |
| onCancel | Function that will be called when user click the Cancel button | `() => void` | - |
