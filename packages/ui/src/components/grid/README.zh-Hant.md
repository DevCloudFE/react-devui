---
title: 栅格
---

栅格系统。

## 何时使用

需要更为灵活的 Flex 布局，或者页面内容需要支持响应式布局。

## API

### DRowProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dColNum | 栅格列数 | number | 12 |
| dBreakpoints | 断点 | Map\<DBreakpoints, number\> | `['xs', 0]`, `['sm', 576]`, `['md', 768]`, `['lg', 992]`, `['xl', 1200]`, `['xxl', 1400]` |
| dGutter | 栅格间隔，写成数组形式表示 `[垂直间距, 水平间距]` | DGutterValue | 0 |
| dResponsiveGutter | 栅格间隔支持响应式布局 | Record\<DBreakpoints, DGutterValue\> | - |
| dAsListener | 仅用作媒体查询，为 `true` 时不会渲染包裹元素 | boolean | false |
| dRender | 使用渲染函数的方式能够获取当前断点 | `(match: DBreakpoints \| null, matchs: DBreakpoints[]) => React.ReactNode` | - |
| onMediaChange | 断点改变时的回调 | `(match: DBreakpoints \| null, matchs: DBreakpoints[]) => void` | - | 
<!-- prettier-ignore-end -->

### DColProps

继承 `DColBaseProps`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| xs | 断点设置，当屏幕宽度大于等于 `dBreakpoints` 中的 `xs` 时生效，默认即为 `>= 0`，设置为 `true` 表示自适应宽度，可以传递 `DColBaseProps` | DSpanValue \| DColBaseProps | - |
| sm | 参考 `xs` | DSpanValue \| DColBaseProps | - |
| md | 参考 `xs` | DSpanValue \| DColBaseProps | - |
| lg | 参考 `xs` | DSpanValue \| DColBaseProps | - |
| xl | 参考 `xs` | DSpanValue \| DColBaseProps | - |
| xxl | 参考 `xs` | DSpanValue \| DColBaseProps | - |
<!-- prettier-ignore-end -->

### DColBaseProps

继承 `React.HTMLAttributes<HTMLDivElement>`。

<!-- prettier-ignore-start -->
| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| dSpan | 占据的栅格数，设置为 `true` 表示自适应宽度，为 `0` 不会渲染节点 | DSpanValue | - |
<!-- prettier-ignore-end -->

### DBreakpoints

```tsx
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
