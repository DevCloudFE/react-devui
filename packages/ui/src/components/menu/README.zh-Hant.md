---
title: 导航菜单
---

为页面和功能提供导航的菜单列表。

## 何时使用

用户需要顶部导航或者侧边导航。

## API

### DMenuProps

继承 `React.HTMLAttributes<HTMLElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dActive | 手动控制活动的菜单项，值为 `dId` | string | - |
| dDefaultActive | 默认的活动菜单项，值为 `dId` | string | - |
| dDefaultExpands | 默认展开的子菜单，值为 `dId` | string[]  | - |
| dMode | 菜单类型 | 'horizontal' \| 'vertical' \| 'popup' \| 'icon' | 'vertical' |
| dExpandOne | 保持同一层级的菜单至多展开一个子菜单 | boolean | false |
| dExpandTrigger | 如何触发展开，默认根据 `dMode` 调整触发行为 | 'hover' \| 'click' | - |
| onActiveChange | 活动菜单项改变的回调 | `(id: string) => void` | - |
| onExpandsChange | 展开子菜单改变的回调 | `(ids: string[]) => void` | - |
<!-- prettier-ignore-end -->

### DMenuGroupProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dId | 唯一标识 | string | - |
| dTitle | 菜单分组的标题 | React.ReactNode | - |
<!-- prettier-ignore-end -->

### DMenuSubProps

继承 `React.LiHTMLAttributes<HTMLLIElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dId | 唯一标识 | string | - |
| dIcon | 设置子菜单图标 | React.ReactNode | - |
| dTitle | 设置子菜单标题 | React.ReactNode | - |
| dDisabled | 是否禁用 | boolean | false |
<!-- prettier-ignore-end -->

### DMenuItemProps

继承 `React.LiHTMLAttributes<HTMLLIElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dId | 唯一标识 | string | - |
| dIcon | 设置菜单项图标 | React.ReactNode | - |
| dDisabled | 是否禁用 | boolean | false |
<!-- prettier-ignore-end -->
