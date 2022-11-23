---
group: General
title: FAB
---

## API

### DFabProps

```tsx
interface DFabProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement<DFabButtonProps>;
  dExpand?: boolean;
  dList?: { placement: 'top' | 'right' | 'bottom' | 'left'; actions: React.ReactElement<DFabButtonProps>[] }[];
  onExpandChange?: (expand: boolean) => void;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dExpand | Whether to pop up the button, controlled, the default is `false` | - |  |
| dList | Set button list | - |  |
| onExpandChange | Callback for button popup state change | - |  |
<!-- prettier-ignore-end -->

### DFabButtonProps

```tsx
interface DFabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dType?: 'primary' | 'secondary' | 'outline' | 'dashed' | 'text' | 'link';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dLoading?: boolean;
  dVariant?: 'circle' | 'round';
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dType | Set button type | `'primary'` |  |
| dTheme | Set button theme color | `'primary'` |  |
| dLoading | The button appears to be loading | `false` |  |
| dVariant | Set button variant | - |  |
<!-- prettier-ignore-end -->

### DFabBacktopProps

```tsx
interface DFabBacktopProps extends DFabButtonProps {
  dPage?: DRefExtra;
  dDistance?: number | string;
  dScrollBehavior?: 'instant' | 'smooth';
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dPage | Set the scrolling page, the default is the scrolling container provided by the global configuration | - |  |
| dDistance | Set how far to scroll to display the button | `400` |  |
| dScrollBehavior | Set scrolling behavior | `'instant'` |  |
<!-- prettier-ignore-end -->
