---
group: Navigation
title: Dropdown
---

List that pops down.

## When To Use

When there are too many operation commands on the page, this component can be used to store operation commands.

## API

### DDropdownProps

Extend `React.HTMLAttributes<HTMLElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dTriggerNode | Target node | React.ReactNode | - |
| dVisible | Manual control menu display | [boolean, Updater\<boolean\>] | - |
| dPlacement | Menu pop-up position | 'top' \| 'top-left' \| 'top-right' \| 'bottom' \| 'bottom-left' \| 'bottom-right' | 'bottom-right' |
| dTrigger | The trigger behavior of the menu pop-up | 'hover' \| 'click' | 'hover' |
| dSubTrigger | Trigger behavior of submenu popup | 'hover' \| 'click' | 'hover' |
| dDestroy | Destroy the node after shutdown | boolean | false |
| dArrow | Whether to show arrow | boolean | false |
| dCloseOnItemClick | Click on the menu item to close the menu | boolean | true |
| onVisibleChange | Menu display/hide callback | `(visible: boolean) => void` | - |
| onItemClick | Click the callback of the menu item | `(id: string) => void` | - |
<!-- prettier-ignore-end -->

### DDropdownSubProps

Extend `React.LiHTMLAttributes<HTMLLIElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dId | Uniquely identifies | string | - |
| dIcon | Settings submenu icon | React.ReactNode | - |
| dTitle | Set submenu title | React.ReactNode | - |
| dDisabled | Whether to disable | boolean | false |
<!-- prettier-ignore-end -->

### DDropdownItemProps

Extend `React.LiHTMLAttributes<HTMLLIElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dId | Uniquely identifies | string | - |
| dIcon | Set menu item icon | React.ReactNode | - |
| dDisabled | Whether to disable | boolean | false |
<!-- prettier-ignore-end -->
