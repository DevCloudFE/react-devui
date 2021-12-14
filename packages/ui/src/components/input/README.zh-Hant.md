---
title: 输入框
---

输入框是最基本的接收用户文本输入的组件。

## 何时使用

用户需要输入内容时。

## API

### DInputProps

继承 `React.InputHTMLAttributes<HTMLInputElement>`，[DFormControl](/components/Form#DFormControl)。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dValue | 绑定值 | [string, Updater\<string\>?] | - |
| dSize | 设置输入框尺寸 | 'smaller' \| 'larger' | - |
| onValueChange | 绑定值改变的回调 | `(value: string) => void` | - |
<!-- prettier-ignore-end -->

### DInputRef

```tsx
export type DInputRef = HTMLInputElement;
```

### DInputAffixProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dPrefix | 输入框前缀 | React.ReactNode | - |
| dSuffix | 输入框后缀 | React.ReactNode | - |
| dDisabled | 是否禁用 | boolean | false |
| dPassword | 是否为密码框 | boolean | false |
| dPasswordToggle | 密码框是否能够切换密码显示 | boolean | true |
| dClearable | 是否能够清除 | boolean | false |
| dClearIcon | 自定义清除图标 | React.ReactNode | - |
| dSize | 输入框尺寸 | 'smaller' \| 'larger' | - |
<!-- prettier-ignore-end -->
