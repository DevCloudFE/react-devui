---
title: 标签
---

## API

### DTagProps

```tsx
interface DTagProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: 'primary' | 'fill' | 'outline';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dColor?: string;
  dSize?: DSize;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dType | 设置标签类型 | `'primary'` |  |
| dTheme | 设置标签主题色 | - |  |
| dColor | 自定义颜色 | - |  |
| dSize | 设置标签大小 | - |  |
<!-- prettier-ignore-end -->
