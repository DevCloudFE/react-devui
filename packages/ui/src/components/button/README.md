---
group: General
title: Button
aria: button
compose: true
---

## API

### DButtonProps

```tsx
interface DButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dType?: 'primary' | 'secondary' | 'outline' | 'dashed' | 'text' | 'link';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dLoading?: boolean;
  dBlock?: boolean;
  dVariant?: 'circle' | 'round';
  dSize?: DSize;
  dIcon?: React.ReactNode;
  dIconRight?: boolean;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dType | Set button type | `'primary'` |  |
| dTheme | Set button theme color | `'primary'` |  |
| dLoading | The button appears to be loading | `false` |  |
| dBlock | Set button width to 100% | `false` |  |
| dVariant | Set button variant | - |  |
| dSize | Set button size | - |  |
| dIcon | Set button icon, left by default | - |  |
| dIconRight | Whether the button icon is right | `false` |  |
<!-- prettier-ignore-end -->
