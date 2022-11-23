---
title: 加载指示器
---

## API

### DSpinnerProps

```tsx
interface DSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dText?: React.ReactNode;
  dDelay?: number;
  dSize?: number;
  dAlone?: boolean;
  afterVisibleChange?: (visible: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dVisible | 是否显示加载指示器 | `true` | |
| dText | 设置文本 | - | |
| dDelay | 延时显/隐，防止视觉抖动 | - | |
| dSize | 设置加载指示器大小 | `28` | |
| dAlone | 作为独立元素显示 | `false` |  |
| afterVisibleChange | 完成显/隐的回调 | - |  |
<!-- prettier-ignore-end -->
