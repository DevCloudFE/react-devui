---
title: 按钮
---

基本的按钮。

## 何时使用

响应用户点击行为。

## API

### DButtonProps

继承 `React.ButtonHTMLAttributes<HTMLButtonElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dType | 设置按钮形态 | 'primary' \| 'secondary' \| 'outline' \| 'dashed' \| 'text' \| 'link' | - |
| dColor | 设置按钮颜色 | 'primary' \| 'success' \| 'warning' \| 'danger' | - |
| dLoading | 设置按钮载入状态 | boolean | false |
| dBlock | 将按钮宽度调整为其父宽度 | boolean | false |
| dShape | 设置按钮形状 | 'circle' \| 'round' | - |
| dSize | 设置按钮大小 | 'smaller' \| 'larger' | - |
| dIcon | 设置按钮的图标 | React.ReactNode | - |
| dIconLeft | 设置图标在左侧 | boolean | true |
<!-- prettier-ignore-end -->

### DButtonGroupProps

等于 `React.HTMLAttributes<HTMLDivElement> & Pick<DButtonProps, 'dType' | 'dColor' | 'dSize'>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dType | 设置按钮组中按钮的形态 | 参考 DButtonProps['dType'] | 'secondary' |
| dColor | 设置按钮组中按钮的颜色 | 参考 DButtonProps['dColor'] | 'primary' |
| dSize | 设置按钮组中按钮的大小 | 参考 DButtonProps['dSize'] | - |
<!-- prettier-ignore-end -->
