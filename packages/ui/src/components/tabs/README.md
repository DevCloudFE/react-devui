---
group: Navigation
title: Tabs
---

## API

### DTabsProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dActive | Manually control the active tab item, the value is `dId` | [string \| null, Updater\<string \| null\>?] | - |
| dPlacement | Tab position | 'top' \| 'right' \| 'bottom' \| 'left'  | 'top' |
| dCenter | Tab centered | boolean | false |
| dType | Tab style | 'wrap' \| 'slider' | - |
| dSize | Tab size | 'smaller' \| 'larger' | - |
| dDropdownProps | Custom drop-down menu | [DDropdownProps](/components/Dropdown#DDropdownProps) | - |
| dTabAriaLabel | Provide the `aria-label` attribute of tablist | string | - |
| onActiveChange | Callback when the active tab item is changed | `(id: string) => void` | - |
| onAddClick | Add tab callback, provide this value to enable the function of adding tabs | `() => void` | - |
| onClose | Callback when the tab is closed | `(id: string) => void` | - |
<!-- prettier-ignore-end -->

### DTabProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dId | Uniquely identifies | string | - |
| dTitle | Title of the tab | React.ReactNode | - |
| dDisabled | Whether to disable | boolean | false |
| dClosable | Can be closed | boolean | false |
| dCloseIcon | Custom close icon | React.ReactNode | - |
<!-- prettier-ignore-end -->
