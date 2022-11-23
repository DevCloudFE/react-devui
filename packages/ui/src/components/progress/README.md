---
group: Feedback
title: Progress
aria: meter
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dPercent | set percentage | `0` | |
| dType | set the progress bar type | `'line'` | |
| dStatus | set progress bar status | - | |
| dWave | Whether to show wave effects | `false` | |
| dLineCap | set line cap | `'round'` | |
| dLinearGradient | set linear gradient | - | |
| dGapDegree | Set the gap radian | `0.55 * Math.PI` | |
| dLabel | set label | - | |
| dSize | set the progress bar size | - | |
| dLineWidth | Set the line width of the progress bar | `8` | |
<!-- prettier-ignore-end -->
