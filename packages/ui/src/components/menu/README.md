---
group: Navigation
title: Menu
---

A list of menus that provide navigation for pages and functions.

## When To Use

Users need top navigation or side navigation.

## API

### DMenuProps

继承 `React.HTMLAttributes<HTMLElement>`。

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dActive | Manually control the active menu item, the value is `key` | string | - |
| dDefaultActive | The default active menu item, the value is `key` | string | - |
| dDefaultExpands | The sub-menu expanded by default, the value is `key` | string[]  | - |
| dMode | Menu type | 'horizontal' \| 'vertical' \| 'popup' \| 'icon' | 'vertical' |
| dExpandOne | Keep the same level of the menu, expand at most one sub-menu | boolean | false |
| dExpandTrigger | How to trigger the expansion, adjust the trigger behavior according to `dMode` by default | 'hover' \| 'click' | - |
| dHeader | Menu header | React.ReactNode | - |
| dFooter | Menu footer | React.ReactNode | - |
| onActiveChange | Callback for active menu item change | `(id: string) => void` | - |
| onExpandsChange | Callback for changes in expanded submenu | `(ids: string[]) => void` | - |
<!-- prettier-ignore-end -->

### DMenuGroupProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dId | Uniquely identifies | string | - |
| dTitle | The title of the menu group | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DMenuSubProps

继承 `React.LiHTMLAttributes<HTMLLIElement>`。

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dId | Uniquely identifies | string | - |
| dIcon | Settings submenu icon | React.ReactNode | - |
| dTitle | Set submenu title | React.ReactNode | - |
| dDefaultExpand | Whether to expand by default | boolean | - |
| dDisabled | Whether to disable | boolean | false |
<!-- prettier-ignore-end -->

### DMenuItemProps

继承 `React.LiHTMLAttributes<HTMLLIElement>`。

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dId | Uniquely identifies | string | - |
| dIcon | Set menu item icon | React.ReactNode | - |
| dDisabled | Whether to disable | boolean | false |
<!-- prettier-ignore-end -->
