---
title: 文本域
---

多行纯文本编辑控件。

## 何时使用

希望允许用户输入大量自由格式的文本，例如对评论或反馈表的评论。

## API

### DTextareaProps

继承 `React.InputHTMLAttributes<HTMLTextAreaElement>, DFormControl`，[DFormControl](/components/Form#DFormControl)。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dValue | 绑定值 | [string, Updater\<string\>?] | - |
| dRows | 设置行数，`'auto'` 代表自动变化，也可传递最大最小值   | 'auto' \| { minRows?: number; maxRows?: number } | - |
| dResizable | 尺寸是否可变化 | boolean | true |
| dShowCount | 显示输入字数 | boolean | `((num: number) => React.ReactNode)` | false |
| onValueChange | 绑定值改变的回调 | `(value: string) => void` | - |
<!-- prettier-ignore-end -->

### DTextareaRef

```tsx
export type DTextareaRef = HTMLTextAreaElement;
```
