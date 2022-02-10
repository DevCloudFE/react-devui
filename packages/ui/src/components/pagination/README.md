---
group: Navigation
title: Pagination
---

## API

### DPaginationProps

Extend `React.HTMLAttributes<HTMLElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dActive | Manually control the number of active pages | [number, Updater\<number\>?] | 1 |
| dTotal | Total number of entries | number | - |
| dPageSize | Number of entries per page | [number, Updater\<number\>?] | - |
| dPageSizeOptions | Number of items per page to choose from | number[] | [10, 20, 50, 100] |
| dCompose | Free combination configuration | `Array<'total' \| 'pages' \| 'size' \| 'jump'>` | ['pages'] |
| dCustomRender | Custom configuration | `{ total?: (range: [number, number]) => React.ReactNode; prev?: React.ReactNode; page?: (page: number) => React.ReactNode; next?: React.ReactNode; sizeOption?: (size: number) => React.ReactNode; jump?: (input: React.ReactNode) => React.ReactNode; }` | - |
| dMini | Mini form | boolean | false |
| onActiveChange | Callback when the number of active pages has changed | `(page: number) => void` | - |
| onPageSizeChange | Callback when the number of items per page has changed | `(size: number) => void` | - |
<!-- prettier-ignore-end -->
