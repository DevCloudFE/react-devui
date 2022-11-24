---
group: General
title: Icon
---

Based on `@ant-design/icons-svg` package.

To use the icon library, you need to install `@react-devui/icons`:

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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dTheme | set icon theme color | - | |
| dSize | set icon size | `'1em'` | |
| dRotate | set icon rotation angle | - | |
| dSpin | Whether to enable spin animation | - | |
| dSpinSpeed | set spin animation period (unit: s) | `1` | |
| dTwoToneColor | Set the theme color of two-tone icons | - | |
<!-- prettier-ignore-end -->
