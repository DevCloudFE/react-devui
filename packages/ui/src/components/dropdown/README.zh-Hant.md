---
title: 下拉菜单
---

向下弹出的列表。

## 何时使用

当页面上的操作命令过多时，用此组件可以收纳操作命令。

## API

### DDropdownProps

继承 `React.HTMLAttributes<HTMLElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dTriggerNode | 目标节点 | React.ReactNode | - |
| dVisible | 手动控制菜单的显示 | [boolean, Updater\<boolean\>] | - |
| dPlacement | 菜单弹出位置 | 'top' \| 'top-left' \| 'top-right' \| 'bottom' \| 'bottom-left' \| 'bottom-right' | 'bottom-right' |
| dTrigger | 菜单弹出的触发行为 | 'hover' \| 'click' | 'hover' |
| dSubTrigger | 子菜单弹出的触发行为 | 'hover' \| 'click' | 'hover' |
| dDestroy | 关闭后销毁节点 | boolean | false |
| dArrow | 是否显示箭头 | boolean | false |
| dCloseOnItemClick | 点击菜单项是否关闭菜单 | boolean | true |
| dPopupClassName | 向弹窗添加 className | string | - |
| onVisibleChange | 菜单显示/隐藏的回调 | `(visible: boolean) => void` | - |
| onItemClick | 点击菜单项的回调 | `(id: string) => void` | - |
<!-- prettier-ignore-end -->

### DDropdownGroupProps

继承 `React.LiHTMLAttributes<HTMLLIElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dId | 唯一标识 | string | - |
| dTitle | 菜单分组的标题 | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DDropdownSubProps

继承 `React.LiHTMLAttributes<HTMLLIElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dId | 唯一标识 | string | - |
| dIcon | 设置子菜单图标 | React.ReactNode | - |
| dTitle | 设置子菜单标题 | React.ReactNode | - |
| dDisabled | 是否禁用 | boolean | false |
| dPopupClassName | 向弹窗添加 className | string | - |
<!-- prettier-ignore-end -->

### DDropdownItemProps

继承 `React.LiHTMLAttributes<HTMLLIElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dId | 唯一标识 | string | - |
| dIcon | 设置菜单项图标 | React.ReactNode | - |
| dDisabled | 是否禁用 | boolean | false |
<!-- prettier-ignore-end -->
