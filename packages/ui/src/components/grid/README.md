---
group: Layout
title: Grid
---

Grid system.

## When To Use

Need more flexible Flex layout, or page content needs to support responsive layout.

## API

### DRowProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dColNum | Number of grid columns | number | 12 |
| dBreakpoints | Breakpoint | Map\<DBreakpoints, number\> | `['xs', 0]`, `['sm', 576]`, `['md', 768]`, `['lg', 992]`, `['xl', 1200]`, `['xxl', 1400]` |
| dGutter | Grid interval, written as an array to represent `[Vertical Spacing, Horizontal Spacing]` | DGutterValue | 0 |
| dResponsiveGutter | Grid spacing supports responsive layout | Record\<DBreakpoints, DGutterValue\> | - |
| dAsListener | Only used as a media query, the package element will not be rendered when `true` | boolean | false |
| dRender | Use the rendering function to get the current breakpoint | `(match: DBreakpoints \| null, matchs: DBreakpoints[]) => React.ReactNode` | - |
| onMediaChange | Callback when the breakpoint changes | `(match: DBreakpoints \| null, matchs: DBreakpoints[]) => void` | - | 
<!-- prettier-ignore-end -->

### DColProps

Extend `DColBaseProps`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| xs | The breakpoint setting takes effect when the screen width is greater than or equal to the `xs` in `dBreakpoints`, the default is `>= 0`, set to `true` means adaptive width, you can pass `DColBaseProps` | DSpanValue \| DColBaseProps | - |
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
export type DBreakpoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
```

### DGutterValue

```tsx
export type DGutterValue = number | string | [number | string, number | string];
```

### DSpanValue

```tsx
export type DSpanValue = number | true;
```
