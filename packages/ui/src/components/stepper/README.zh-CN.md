---
title: 步骤条
---

## API

### DStepperProps

```tsx
interface DStepperItem {
  step?: number;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: 'completed' | 'active' | 'wait' | 'error';
}

interface DStepperProps<T extends DStepperItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dActive?: number;
  dPercent?: number;
  dVertical?: boolean;
  dIconSize?: number;
  dLabelBottom?: boolean;
  dClickable?: boolean;
  onItemClick?: (step: number, item: T) => void;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dList | 数据列表 | - |  |
| dActive | 激活步骤，默认为 `dList[0].step ?? 1` | - |  |
| dPercent | 设置当前步骤的进度 | - |  |
| dVertical | 设置垂直显示 | `false` |  |
| dIconSize | 设置步骤图标大小 | `36` |  |
| dLabelBottom | 步骤标签是否位于图标下方 | `false` |  |
| dClickable | 步骤是否可点击 | `false` |  |
| onItemClick | 点击步骤的回调 | - |  |
<!-- prettier-ignore-end -->
