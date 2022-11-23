---
title: 进度条
---

## API

### DProgressProps

```tsx
interface DProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dPercent?: number;
  dType?: 'line' | 'circle' | 'dashboard';
  dStatus?: 'success' | 'warning' | 'error' | 'process';
  dWave?: boolean;
  dLineCap?: 'butt' | 'round' | 'square' | 'inherit';
  dLinearGradient?: React.ReactElement<React.SVGProps<SVGLinearGradientElement>>;
  dGapDegree?: number;
  dLabel?: React.ReactNode;
  dSize?: number;
  dLineWidth?: number;
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dPercent | 设置百分比 | `0` | |
| dType | 设置进度条类型 | `'line'` | |
| dStatus | 设置进度条状态 | - | |
| dWave | 是否显示波动效果 | `false` | |
| dLineCap | 设置线帽 | `'round'` | |
| dLinearGradient | 设置线性渐变 | - | |
| dGapDegree | 设置缺口弧度 | `0.55 * Math.PI` | |
| dLabel | 设置标签 | - | |
| dSize | 设置进度条大小 | - | |
| dLineWidth | 设置进度条线宽 | `8` | |
<!-- prettier-ignore-end -->
