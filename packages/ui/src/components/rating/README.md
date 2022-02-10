---
group: Data Entry
title: Rating
---

## API

### DRatingProps

Extend `React.HTMLAttributes<HTMLDivElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dModel | Manual control value | [number, Updater\<number\>?] | - |
| dName | The `name` attribute of a radio option | string | - |
| dTotal | Number of ratings | number | 5 |
| dHalf | Whether to allow semi-selection | boolean | false |
| dDisabled | Whether to disable | boolean | false |
| dReadOnly | Whether read-only | boolean | false |
| dCustomIcon | Custom display | React.ReactNode \| `((value: number) => React.ReactNode)` | - |
| dTooltip | Set reminder | `(value: number) => React.ReactNode` | - |
| onModelChange | Callback for selected item change | `(value: number) => void` | - |
<!-- prettier-ignore-end -->
