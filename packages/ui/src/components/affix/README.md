---
group: Layout
title: Affix
---

## API

### DAffixProps

```tsx
interface DAffixProps {
  children: React.ReactElement;
  dTarget?: DRefExtra | false;
  dTop?: number | string;
  dZIndex?: number | string;
}
```

<!-- prettier-ignore-start -->
| Property | Description | Default | Version | 
| --- | --- | --- | --- | 
| dTarget | Set the target element, `false` means the `parentElement` of the element, the default is the scroll container provided by the global configuration | - |  |
| dTop | The `top` value of the affix away from the target element | `0` |  |
| dZIndex | Set the `z-index` of the affix | - |  |
<!-- prettier-ignore-end -->
