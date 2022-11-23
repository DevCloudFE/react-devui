---
title: 表单
---

## API

### DFormProps

```tsx
interface DFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  dUpdate: () => void;
  dLabelWidth?: number | string;
  dLabelColon?: boolean;
  dRequiredType?: 'required' | 'optional' | 'hidden';
  dLayout?: 'horizontal' | 'vertical' | 'inline';
  dInlineSpan?: number | true;
  dFeedbackIcon?:
    | boolean
    | {
        success?: React.ReactNode;
        warning?: React.ReactNode;
        error?: React.ReactNode;
        pending?: React.ReactNode;
      };
  dSize?: DSize;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dUpdate | 提供表单更新 | - |  |
| dLabelWidth | 设置标签长度 | - |  |
| dLabelColon | 是否显示标签后的冒号 | - |  |
| dRequiredType | 设置如何显示必填项 | `'required'` |  |
| dLayout | 设置表单布局 | `'horizontal'` |  |
| dInlineSpan | 设置 `inline` 布局下表单项占用列数 | `6` |  |
| dFeedbackIcon | 设置表单项状态的反馈图标 | `false` |  |
| dSize | 设置表单项大小 | - |  |
<!-- prettier-ignore-end -->

### DFormGroupProps

```tsx
interface DFormGroupProps {
  children: React.ReactNode;
  dFormGroup: FormGroup;
  dTitle?: React.ReactNode;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dFormGroup | 提供数据 | - |  |
| dTitle | 设置标题 | - |  |
<!-- prettier-ignore-end -->

### DFormItemProps

```tsx
type DErrorInfo =
  | string
  | { message: string; status: 'warning' | 'error' }
  | { [index: string]: string | { message: string; status: 'warning' | 'error' } };

interface DFormItemProps<T extends { [index: string]: DErrorInfo }> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactNode | ((formControls: { [N in keyof T]: DFormControl }) => React.ReactNode);
  dFormControls?: T;
  dLabel?: React.ReactNode;
  dLabelWidth?: number | string;
  dLabelExtra?: ({ title: string; icon?: React.ReactElement } | string)[];
  dShowRequired?: boolean;
  dColNum?: number;
  dSpan?: number | string | true;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dFormControls | 提供数据 | - |  |
| dLabel | 设置标签 | - |  |
| dLabelWidth | 设置标签长度 | - |  |
| dLabelExtra | 设置标签的额外内容 | - |  |
| dShowRequired | 是否显示为必填项 | - |  |
| dColNum | 设置列总数 | `12` |  |
| dSpan | 设置占用列数 | - |  |
<!-- prettier-ignore-end -->
