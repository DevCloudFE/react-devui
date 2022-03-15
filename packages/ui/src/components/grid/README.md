---
group: Layout
title: Grid
---

## API

### DRowProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dGutter | Grid interval, written as an array to represent `[Vertical Spacing, Horizontal Spacing]` | DGutterValue | 0 |
| dResponsiveGutter | Grid spacing supports responsive layout | Record\<DBreakpoints, DGutterValue\> | - |
<!-- prettier-ignore-end -->

### DColProps

Extend `DColBaseProps`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| xs | Breakpoint setting. It takes effect when the screen width is greater than or equal to the breakpoint corresponding to `xs`. The default value is `>= 0`. If set to `true`, it means adaptive width. You can pass `DColBaseProps` | DSpanValue \| DColBaseProps | - |
| sm | Reference `xs` | DSpanValue \| DColBaseProps | - |
| md | Reference `xs` | DSpanValue \| DColBaseProps | - |
| lg | Reference `xs` | DSpanValue \| DColBaseProps | - |
| xl | Reference `xs` | DSpanValue \| DColBaseProps | - |
| xxl | Reference `xs` | DSpanValue \| DColBaseProps | - |
<!-- prettier-ignore-end -->

### DColBaseProps

Extend `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dSpan | The number of grids occupied, set to `true` to indicate adaptive width, to `0`, no node will be rendered | DSpanValue | - |
<!-- prettier-ignore-end -->

### DBreakpoints

```tsx
/**
 * Default setting.
 *
 * **xs**: 0
 * **sm**: 576
 * **md**: 768
 * **lg**: 992
 * **xl**: 1200
 * **xxl**: 1400
 *
 */
type DBreakpoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
```

### DGutterValue

```tsx
type DGutterValue = number | string | [number | string, number | string];
```

### DSpanValue

```tsx
type DSpanValue = number | true;
```
