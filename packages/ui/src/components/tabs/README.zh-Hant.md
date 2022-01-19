---
title: 页签面板
---

页签切换组件。

## 何时使用

用户需要通过平级的区域将大块内容进行收纳和展现，保持界面整洁。

## API

### DTabsProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dActive | 手动控制活动的页签项，值为 `dId` | [string \| null, Updater\<string \| null\>?] | - |
| dPlacement | 页签位置 | 'top' \| 'right' \| 'bottom' \| 'left'  | 'top' |
| dCenter | 页签居中 | boolean | false |
| dType | 页签样式 | 'wrap' \| 'slider' | - |
| dSize | 页签尺寸 | 'smaller' \| 'larger' | - |
| dDropdownProps | 自定义下拉菜单 | [DDropdownProps](/components/Dropdown#DDropdownProps) | - |
| dTabAriaLabel | 提供 tablist 的 `aria-label` 属性 | string | - |
| onActiveChange | 活动页签项改变的回调 | `(id: string) => void` | - |
| onAddClick | 添加页签的回调，提供该值启用添加页签的功能 | `() => void` | - |
| onClose | 页签关闭的回调 | `(id: string) => void` | - |
<!-- prettier-ignore-end -->

### DTabProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dId | 唯一标识 | string | - |
| dTitle | 页签的标题 | React.ReactNode | - |
| dDisabled | 是否禁用 | boolean | false |
| dClosable | 是否可关闭 | boolean | false |
| dCloseIcon | 自定义关闭图标 | React.ReactNode | - |
<!-- prettier-ignore-end -->
