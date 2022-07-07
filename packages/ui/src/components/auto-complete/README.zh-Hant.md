---
title: 自动完成
---

## API

### DInputProps

继承 `React.InputHTMLAttributes<HTMLInputElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dModel | 绑定值 | [string, Updater\<string\>?] | - |
| dSize | 设置输入框尺寸 | 'smaller' \| 'larger' | - |
| onModelChange | 绑定值改变的回调 | `(value: string) => void` | - |
<!-- prettier-ignore-end -->

### DInputRef

```tsx
type DInputRef = HTMLInputElement;
```

### DInputProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dPrefix | 输入框前缀 | React.ReactNode | - |
| dSuffix | 输入框后缀 | React.ReactNode | - |
| disabled | 是否禁用 | boolean | false |
| dPassword | 是否为密码框 | boolean | false |
| dPasswordToggle | 密码框是否能够切换密码显示 | boolean | true |
| dNumber | 是否为数字框 | boolean | false |
| dClearable | 是否能够清除 | boolean | false |
| dClearIcon | 自定义清除图标 | React.ReactNode | - |
| dSize | 输入框尺寸 | 'smaller' \| 'larger' | - |
<!-- prettier-ignore-end -->
