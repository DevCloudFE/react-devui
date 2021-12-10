---
title: 组合
---

用来组合各种不同组件来形成一个整体。

## 何时使用

常用于组合各种输入部件或者按钮。

## API

### DComposeProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dSize | 设置子项大小 | 'smaller' \| 'larger' | - |
| dDisabled | 是否禁用子项 | boolean | false |
<!-- prettier-ignore-end -->

### DComposeItemProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dGray | 常用的偏灰背景 | boolean | false |
<!-- prettier-ignore-end -->
