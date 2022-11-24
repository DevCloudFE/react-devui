---
title: 图标
---

基于 `@ant-design/icons-svg` 封装。

使用图标库，您需要安装 `@react-devui/icons`：

```bash
yarn add @react-devui/icons
```

## API

```tsx
interface Props extends React.SVGAttributes<SVGElement> {
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dSize?: number | string | [number | string, number | string];
  dRotate?: number;
  dSpin?: boolean;
  dSpinSpeed?: number | string;
  dTwoToneColor?: [string, string];
}
```

<!-- prettier-ignore-start -->
| 属性 | 说明 | 默认值 | 版本 | 
| --- | --- | --- | --- | 
| dTheme | 设置图标主题色 | - |  |
| dSize | 设置图标大小 | `'1em'` |  |
| dRotate | 设置图标旋转角度 | - |  |
| dSpin | 是否启用旋转动画 | - |  |
| dSpinSpeed | 设置旋转动画周期（单位：s） | `1` |  |
| dTwoToneColor | 设置双色图标主题色 | - |  |
<!-- prettier-ignore-end -->
