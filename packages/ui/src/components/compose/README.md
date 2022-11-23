---
group: General
title: Compose
---

## API

### DComposeProps

```tsx
interface DComposeProps extends React.HTMLAttributes<HTMLDivElement> {
  dSize?: DSize;
  dVertical?: boolean;
  dDisabled?: boolean;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dSize | Set the size of the compose item | - |  |
| dVertical | Set vertical alignment | `false` |  |
| dDisabled | Disabled | `false` |  |
<!-- prettier-ignore-end -->

### DComposeItemProps

```tsx
interface DComposeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  dGray?: boolean;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dGray | Set light gray background | `false` |  |
<!-- prettier-ignore-end -->
