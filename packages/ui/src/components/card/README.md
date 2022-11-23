---
group: Data Display
title: Card
---

## API

### DCardProps

```tsx
interface DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  dBorder?: boolean;
  dShadow?: boolean | 'hover';
  dActions?: React.ReactNode[];
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dBorder | Whether to display the border | `true` |  |
| dShadow | Whether to show shadow | `'false'` |  |
| dActions | Set button group | - |  |
<!-- prettier-ignore-end -->

### DCardHeaderProps

```tsx
interface DCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dAction?: React.ReactNode;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dAction | Set button | - |  |
<!-- prettier-ignore-end -->

### DCardContentProps

```tsx
type DCardContentProps = React.HTMLAttributes<HTMLDivElement>;
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
<!-- prettier-ignore-end -->
