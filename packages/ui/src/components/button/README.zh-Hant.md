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
| dType | 设置按钮形态 | 'primary' \| 'secondary' \| 'outline' \| 'dashed' \| 'text' \| 'link' | 'primary' |
| dColor | 设置按钮颜色 | 'primary' \| 'success' \| 'warning' \| 'danger' | 'primary' |
| dLoading | 设置按钮载入状态 | boolean | false |
| dBlock | 将按钮宽度调整为其父宽度 | boolean | false |
| dShape | 设置按钮形状 | 'circle' \| 'round' | - |
| dSize | 设置按钮大小 | 'smaller' \| 'larger' | - |
| dIcon | 设置按钮的图标 | React.ReactNode | - |
| dIconRight | 设置图标在右侧 | boolean | false |
<!-- prettier-ignore-end -->

### DButtonRef

```tsx
export type DButtonRef = HTMLButtonElement;
```

### DButtonGroupProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dType | 设置按钮组中按钮的形态 | 参考 DButtonProps['dType'] | 'secondary' |
| dColor | 设置按钮组中按钮的颜色 | 参考 DButtonProps['dColor'] | 'primary' |
| dSize | 设置按钮组中按钮的大小 | 参考 DButtonProps['dSize'] | - |
| buttonGroupDisabled | 禁用按钮组中的按钮 | boolean | false |
<!-- prettier-ignore-end -->
