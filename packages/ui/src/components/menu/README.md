---
group: Navigation
title: Menu
---

A list of menus that provide navigation for pages and functions.

## When To Use

Users need top navigation or side navigation.

## API

### DMenuProps

Extend `React.HTMLAttributes<HTMLElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dActive | Manually control the active menu item, the value is `dId` | [string \| null, Updater\<string \| null\>?] | - |
| dExpands | Expanded sub-menu, the value is `dId` | [Set\<string\>, Updater\<Set\<string\>\>?]  | - |
| dMode | Menu type | 'horizontal' \| 'vertical' \| 'popup' \| 'icon' | 'vertical' |
| dExpandOne | Keep the same level of the menu, expand at most one sub-menu | boolean | false |
| dExpandTrigger | How to trigger the expansion, adjust the trigger behavior according to `dMode` by default | 'hover' \| 'click' | - |
| onActiveChange | Callback for active menu item change | `(id: string) => void` | - |
| onExpandsChange | Callback for changes in expanded submenu | `(ids: Set<string>) => void` | - |
<!-- prettier-ignore-end -->

### DMenuGroupProps

Extend `React.LiHTMLAttributes<HTMLLIElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dId | Uniquely identifies | string | - |
| dTitle | The title of the menu group | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DMenuSubProps

Extend `React.LiHTMLAttributes<HTMLLIElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dId | Uniquely identifies | string | - |
| dIcon | Settings submenu icon | React.ReactNode | - |
| dTitle | Set submenu title | React.ReactNode | - |
| dDisabled | Whether to disable | boolean | false |
| dPopupClassName | Add className to the popup | string | - |
<!-- prettier-ignore-end -->

### DMenuItemProps

Extend `React.LiHTMLAttributes<HTMLLIElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dId | Uniquely identifies | string | - |
| dIcon | Set menu item icon | React.ReactNode | - |
| dDisabled | Whether to disable | boolean | false |
<!-- prettier-ignore-end -->
