---
group: General
title: Button
---

Basic buttons.

## When To Use

Respond to user click behavior.

## API

### DButtonProps

Extend `React.ButtonHTMLAttributes<HTMLButtonElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dType | Set button type | 'primary' \| 'secondary' \| 'outline' \| 'dashed' \| 'text' \| 'link' | 'primary' |
| dColor | Set button color | 'primary' \| 'success' \| 'warning' \| 'danger' | 'primary' |
| dLoading | Set button loading state | boolean | false |
| dBlock | Adjust the button width to its parent width | boolean | false |
| dShape | Set the button shape | 'circle' \| 'round' | - |
| dSize | Set button size | 'smaller' \| 'larger' | - |
| dIcon | Set the icon of the button | React.ReactNode | - |
| dIconRight | Settings icon on the right | boolean | false |
| disabled | Set button unavailable | boolean | false |
<!-- prettier-ignore-end -->

### DButtonRef

```tsx
export type DButtonRef = HTMLButtonElement;
```

### DButtonGroupProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dType | Set the shape of the buttons in the button group | Reference DButtonProps['dType'] | 'secondary' |
| dColor | Set the color of the buttons in the button group | Reference DButtonProps['dColor'] | 'primary' |
| dSize | Set the size of the buttons in the button group | Reference DButtonProps['dSize'] | - |
| dDisabled | Disable the buttons in the button group | boolean | false |
<!-- prettier-ignore-end -->
