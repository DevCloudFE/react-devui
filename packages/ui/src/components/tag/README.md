---
group: Data Display
title: Tag
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
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dType | Set tag type | `'primary'` |  |
| dTheme | Set the tag theme color | - |  |
| dColor | custom color | - |  |
| dSize | set tag size | - |  |
<!-- prettier-ignore-end -->
