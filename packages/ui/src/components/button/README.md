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
| dType | Set button type | 'primary' \| 'secondary' \| 'outline' \| 'dashed' \| 'text' \| 'link' | - |
| dColor | Set button color | 'primary' \| 'success' \| 'warning' \| 'danger' | - |
| dLoading | Set button loading state | boolean | false |
| dBlock | Adjust the button width to its parent width | boolean | false |
| dShape | Set the button shape | 'circle' \| 'round' | - |
| dSize | Set button size | 'smaller' \| 'larger' | - |
| dIcon | Set the icon of the button | React.ReactNode | - |
| dIconLeft | Settings icon on the left | boolean | true |
<!-- prettier-ignore-end -->

### DButtonGroupProps

Equal `React.HTMLAttributes<HTMLDivElement> & Pick<DButtonProps, 'dType' | 'dColor' | 'dSize'>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dType | Set the shape of the buttons in the button group | Reference DButtonProps['dType'] | 'secondary' |
| dColor | Set the color of the buttons in the button group | Reference DButtonProps['dColor'] | 'primary' |
| dSize | Set the size of the buttons in the button group | Reference DButtonProps['dSize'] | - |
<!-- prettier-ignore-end -->
