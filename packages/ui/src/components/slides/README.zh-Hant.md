---
title: 走马灯
---

## API

### DTagProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dType | 设置标签形态 | 'primary' \| 'fill' \| 'outline' | 'primary' |
| dTheme | 设置标签主题 | 'primary' \| 'success' \| 'warning' \| 'danger' | - |
| dColor | 自定义标签颜色 | string | - |
| dSize | 设置标签尺寸 | 'smaller' \| 'larger' | - |
| dClosable | 标签是否可关闭 | boolean | false |
| onClose | 点击关闭按钮的回调 | React.MouseEventHandler\<HTMLSpanElement\> | - |
<!-- prettier-ignore-end -->
