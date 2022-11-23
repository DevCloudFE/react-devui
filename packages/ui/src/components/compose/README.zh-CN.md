---
title: 组合
---

## API

### DComposeProps

```tsx
interface DComposeProps extends React.HTMLAttributes<HTMLDivElement> {
  dSize?: DSize;
  dVertical?: boolean;
  dDisabled?: boolean;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dSize | 设置组合项大小 | - |  |
| dVertical | 设置垂直排列 | `false` |  |
| dDisabled | 是否禁用 | `false` |  |
<!-- prettier-ignore-end -->

### DComposeItemProps

```tsx
interface DComposeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  dGray?: boolean;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dGray | 设置浅灰背景 | `false` |  |
<!-- prettier-ignore-end -->
